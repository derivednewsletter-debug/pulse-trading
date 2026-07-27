import type { Adapter, AdapterUser, AdapterAccount, AdapterSession } from 'next-auth/adapters';
import { prisma } from '@/lib/prisma';

/**
 * Custom NextAuth adapter for Prisma 7.
 *
 * Prisma 7 changed its Client API, making the official `@next-auth/prisma-adapter`
 * and `@auth/prisma-adapter` incompatible. This adapter implements the minimal
 * Adapter interface needed for OAuth (Google/GitHub) and credentials sign-in to work.
 */
export function PrismaAdapter(): Adapter {
  return {
    async createUser(user: AdapterUser) {
      const created = await prisma.user.create({
        data: {
          email: user.email!,
          name: user.name,
          image: user.image,
          username: user.email?.split('@')[0] ?? `user_${Date.now()}`,
          displayName: user.name ?? user.email?.split('@')[0] ?? 'User',
        },
      });
      return {
        id: created.id,
        name: created.displayName ?? created.name,
        email: created.email,
        image: created.image,
        emailVerified: null,
      };
    },

    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return {
        id: user.id,
        name: user.displayName ?? user.name,
        email: user.email,
        image: user.image,
        emailVerified: null,
      };
    },

    async getUserByEmail(email: string) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return {
        id: user.id,
        name: user.displayName ?? user.name,
        email: user.email,
        image: user.image,
        emailVerified: null,
      };
    },

    async getUserByAccount({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string;
      provider: string;
    }) {
      const account = await prisma.account.findFirst({
        where: { providerAccountId, provider },
        include: { user: true },
      });
      if (!account) return null;
      return {
        id: account.user.id,
        name: account.user.displayName ?? account.user.name,
        email: account.user.email,
        image: account.user.image,
        emailVerified: null,
      };
    },

    async linkAccount(account: AdapterAccount) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      });
    },

    async createSession(session: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }) {
      await prisma.session.create({
        data: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
      });
      return session as AdapterSession;
    },

    async getSessionAndUser(sessionToken: string) {
      const dbSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!dbSession) return null;
      return {
        session: {
          id: dbSession.id,
          sessionToken: dbSession.sessionToken,
          userId: dbSession.userId,
          expires: dbSession.expires,
        },
        user: {
          id: dbSession.user.id,
          name: dbSession.user.displayName ?? dbSession.user.name,
          email: dbSession.user.email,
          image: dbSession.user.image,
          emailVerified: null,
        },
      };
    },

    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>) {
      await prisma.session.updateMany({
        where: { sessionToken: session.sessionToken },
        data: { expires: session.expires! },
      });
      return null;
    },

    async deleteSession(sessionToken: string) {
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
    },
  };
}

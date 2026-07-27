import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      displayName?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    id: string;
    username?: string | null;
    displayName?: string | null;
  }

  interface User {
    username?: string | null;
    displayName?: string | null;
  }
}

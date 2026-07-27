import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passories do not match',
    path: ['confirmPassword'],
  });

export const postSchema = z.object({
  title: z.string().max(200, 'Title must be under 200 characters').optional(),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be under 50000 characters'),
  type: z.enum(['discussion', 'trade_idea', 'analysis', 'question', 'chart']),
  stock_id: z.string().uuid().optional(),
  is_markdown: z.boolean().default(true),
});

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment is required')
    .max(10000, 'Comment must be under 10000 characters'),
  parent_id: z.string().uuid().optional(),
});

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  display_name: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  type: z.enum(['all', 'stocks', 'users', 'posts']).default('all'),
  page: z.number().int().positive().default(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

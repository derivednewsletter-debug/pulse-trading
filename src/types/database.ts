export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      stocks: {
        Row: Stock;
        Insert: Partial<Stock>;
        Update: Partial<Stock>;
      };
      posts: {
        Row: Post;
        Insert: Partial<Post>;
        Update: Partial<Post>;
      };
      comments: {
        Row: Comment;
        Insert: Partial<Comment>;
        Update: Partial<Comment>;
      };
      likes: {
        Row: Like;
        Insert: Partial<Like>;
        Update: Partial<Like>;
      };
      bookmarks: {
        Row: Bookmark;
        Insert: Partial<Bookmark>;
        Update: Partial<Bookmark>;
      };
      followers: {
        Row: Follower;
        Insert: Partial<Follower>;
        Update: Partial<Follower>;
      };
      stock_followers: {
        Row: StockFollower;
        Insert: Partial<StockFollower>;
        Update: Partial<StockFollower>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification>;
        Update: Partial<Notification>;
      };
      trending: {
        Row: Trending;
        Insert: Partial<Trending>;
        Update: Partial<Trending>;
      };
      ai_summaries: {
        Row: AISummary;
        Insert: Partial<AISummary>;
        Update: Partial<AISummary>;
      };
      news: {
        Row: News;
        Insert: Partial<News>;
        Update: Partial<News>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_post_likes: {
        Args: { post_id: string };
        Returns: void;
      };
      decrement_post_likes: {
        Args: { post_id: string };
        Returns: void;
      };
      increment_post_comments: {
        Args: { post_id: string };
        Returns: void;
      };
      increment_post_views: {
        Args: { post_id: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
}

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  reputation_score: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  description: string | null;
  sector: string | null;
  industry: string | null;
  market_cap: number | null;
  price: number | null;
  change_24h: number | null;
  change_percent_24h: number | null;
  volume: number | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  stock_id: string | null;
  title: string | null;
  content: string;
  content_html: string | null;
  type: 'discussion' | 'trade_idea' | 'analysis' | 'question' | 'chart';
  image_url: string | null;
  is_markdown: boolean;
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  content_html: string | null;
  like_count: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string | null;
  comment_id: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  collection_name: string | null;
  created_at: string;
}

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface StockFollower {
  id: string;
  user_id: string;
  stock_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'mention' | 'stock_activity';
  entity_type: 'post' | 'comment' | 'user' | 'stock';
  entity_id: string | null;
  read: boolean;
  created_at: string;
}

export interface Trending {
  id: string;
  stock_id: string;
  rank: number;
  score: number;
  post_count_24h: number;
  comment_count_24h: number;
  unique_users_24h: number;
  category: 'most_discussed' | 'fastest_growing' | 'most_active' | 'most_commented';
  calculated_at: string;
}

export interface AISummary {
  id: string;
  stock_id: string;
  title: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  bullish_score: number;
  bearish_score: number;
  key_points: string[];
  created_at: string;
}

export interface News {
  id: string;
  stock_id: string;
  title: string;
  url: string;
  source: string;
  summary: string | null;
  sentiment: 'positive' | 'negative' | 'neutral' | null;
  published_at: string;
  created_at: string;
}

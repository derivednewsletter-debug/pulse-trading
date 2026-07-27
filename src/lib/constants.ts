export const STOCK_SECTORS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Energy',
  'Industrials',
  'Basic Materials',
  'Real Estate',
  'Utilities',
  'Communication Services',
] as const;

export const POST_TYPES = [
  { value: 'discussion', label: 'Discussion', icon: 'MessageSquare' },
  { value: 'trade_idea', label: 'Trade Idea', icon: 'TrendingUp' },
  { value: 'analysis', label: 'Analysis', icon: 'BarChart3' },
  { value: 'question', label: 'Question', icon: 'HelpCircle' },
  { value: 'chart', label: 'Chart', icon: 'ChartLine' },
] as const;

export const SENTIMENT_COLORS = {
  bullish: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  bearish: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  neutral: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
} as const;

export const TRENDING_CATEGORIES = {
  most_discussed: { label: 'Most Discussed', icon: 'MessageSquare' },
  fastest_growing: { label: 'Fastest Growing', icon: 'Rocket' },
  most_active: { label: 'Most Active', icon: 'Activity' },
  most_commented: { label: 'Most Commented', icon: 'MessageCircle' },
} as const;

export const ITEMS_PER_PAGE = 20;
export const SEARCH_DEBOUNCE_MS = 300;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_POST_LENGTH = 50000;
export const MAX_COMMENT_LENGTH = 10000;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

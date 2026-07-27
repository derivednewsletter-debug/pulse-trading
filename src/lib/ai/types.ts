export type AIModel = {
  id: string;
  name: string;
  provider: string;
};

export type AIProviderConfig = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
};

export type AICompletionRequest = {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
};

export type AIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AICompletionResponse = {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type AISummaryRequest = {
  stockSymbol: string;
  stockName: string;
  posts: string[];
  news: string[];
  previousSummary?: string;
};

export type AISummaryResponse = {
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  bullishScore: number;
  bearishScore: number;
  keyPoints: string[];
};

export interface AIProvider {
  name: string;
  models: AIModel[];

  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  streamComplete(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<void>;
}

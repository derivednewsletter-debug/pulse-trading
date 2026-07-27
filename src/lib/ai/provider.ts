import type {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AISummaryRequest,
  AISummaryResponse,
} from './types';
import { NVIDIAProvider } from './nvidia';

let provider: AIProvider | null = null;

function getProvider(): AIProvider {
  if (provider) return provider;

  const activeProvider = process.env.AI_PROVIDER ?? 'nvidia';

  switch (activeProvider) {
    case 'nvidia':
      provider = new NVIDIAProvider({
        apiKey: process.env.NVIDIA_API_KEY ?? '',
        model: process.env.AI_MODEL,
      });
      break;
    // Future providers will plug in here with minimal code:
    // case 'openai':
    //   provider = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY });
    //   break;
    // case 'anthropic':
    //   provider = new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY });
    //   break;
    // case 'groq':
    //   provider = new GroqProvider({ apiKey: process.env.GROQ_API_KEY });
    //   break;
    // case 'gemini':
    //   provider = new GeminiProvider({ apiKey: process.env.GEMINI_API_KEY });
    //   break;
    default:
      throw new Error(`Unknown AI provider: ${activeProvider}`);
  }

  return provider;
}

export async function completeAI(
  request: AICompletionRequest
): Promise<AICompletionResponse> {
  const p = getProvider();
  return p.complete(request);
}

export async function streamAI(
  request: AICompletionRequest,
  onChunk: (chunk: string) => void
): Promise<void> {
  const p = getProvider();
  return p.streamComplete(request, onChunk);
}

export async function generateStockSummary(
  request: AISummaryRequest
): Promise<AISummaryResponse> {
  const systemPrompt = `You are an expert financial analyst assistant for Pulse, a trading community platform. 
Analyze the community discussion and news about ${request.stockSymbol} (${request.stockName}).

Provide:
1. A concise summary (2-3 paragraphs) of what the community is discussing
2. Overall sentiment (bullish/bearish/neutral)
3. Bullish score (0-100)
4. Bearish score (0-100)
5. 3-5 key points

Be objective and data-driven. Cite community opinions fairly.`;

  const userPrompt = `Recent community posts about ${request.stockSymbol}:

${request.posts.slice(0, 20).join('\n\n')}

Recent news:

${request.news.slice(0, 10).join('\n\n')}

${request.previousSummary ? `Previous summary context:\n${request.previousSummary}` : ''}

Provide a comprehensive summary in JSON format with keys: summary, sentiment, bullishScore, bearishScore, keyPoints`;

  const response = await completeAI({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    maxTokens: 2048,
  });

  try {
    // Try to parse JSON response
    const parsed = JSON.parse(response.content);
    return {
      summary: parsed.summary ?? response.content,
      sentiment: parsed.sentiment ?? 'neutral',
      bullishScore: parsed.bullishScore ?? 50,
      bearishScore: parsed.bearishScore ?? 50,
      keyPoints: parsed.keyPoints ?? [],
    };
  } catch {
    // Fallback: return raw content as summary
    return {
      summary: response.content,
      sentiment: 'neutral',
      bullishScore: 50,
      bearishScore: 50,
      keyPoints: [],
    };
  }
}

export async function generateAIAssistantResponse(
  question: string,
  stockSymbol: string,
  context: string
): Promise<string> {
  const response = await completeAI({
    messages: [
      {
        role: 'system',
        content: `You are Pulse AI, a helpful trading assistant on the Pulse platform. 
You help traders understand what's happening with ${stockSymbol} based on community discussion, news, and market data.
Be concise, accurate, and helpful. Use natural language.`,
      },
      {
        role: 'user',
        content: `Context about ${stockSymbol}:\n${context}\n\nUser question: ${question}`,
      },
    ],
    temperature: 0.5,
    maxTokens: 1024,
  });

  return response.content;
}

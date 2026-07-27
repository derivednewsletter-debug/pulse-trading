import type {
  AIProvider,
  AIModel,
  AICompletionRequest,
  AICompletionResponse,
} from './types';

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';

export class NVIDIAProvider implements AIProvider {
  name = 'nvidia';
  models: AIModel[] = [
    { id: 'nvidia/llama-3.1-nemotron-70b-instruct', name: 'Nemotron 70B', provider: 'nvidia' },
    { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'nvidia' },
    { id: 'mistralai/mistral-7b-instruct-v0.3', name: 'Mistral 7B', provider: 'nvidia' },
  ];

  private apiKey: string;
  private model: string;

  constructor(config: { apiKey: string; model?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? this.models[0].id;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content ?? '',
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }

  async streamComplete(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        if (trimmed === 'data: [DONE]') return;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices[0]?.delta?.content ?? '';
          if (content) onChunk(content);
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  }
}

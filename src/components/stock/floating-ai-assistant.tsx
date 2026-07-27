'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCsrfToken } from '@/hooks/use-csrf';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FloatingAIAssistantProps {
  symbol: string;
}

export function FloatingAIAssistant({ symbol }: FloatingAIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `Hi! I'm Pulse AI. Ask me anything about ${symbol} — sentiment, news, or community discussions.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { getToken } = useCsrfToken();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = useCallback(async (text?: string) => {
    const message = text || input.trim();
    if (!message || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add CSRF token if user is authenticated
      if (user) {
        const csrfToken = await getToken();
        if (csrfToken) {
          headers['x-csrf-token'] = csrfToken;
        }
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ question: message, stockSymbol: symbol }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, user, getToken, symbol]);

  const quickQuestions = [
    'What is the sentiment today?',
    'Why is it moving?',
    'What are the key levels?',
    'Summarize the discussion',
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/25 transition-all duration-300 hover:bg-indigo-500 hover:scale-105 active:scale-95',
          open && 'scale-0 opacity-0'
        )}
        aria-label="Open AI assistant"
      >
        <Bot className="h-6 w-6" />
      </button>

      <div
        className={cn(
          'fixed bottom-6 right-6 z-40 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-gray-900 shadow-2xl transition-all duration-300 origin-bottom-right',
          open ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">Pulse AI</span>
              <span className="text-[10px] text-green-400 ml-2">● Online</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close AI assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-2',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-sm max-w-[85%]',
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-white/5 text-white/80 rounded-tl-sm'
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:text-white hover:bg-white/10 hover:border-indigo-500/30 transition-all disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                  <span className="text-xs text-white/40">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask about ${symbol}...`}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

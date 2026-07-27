'use client';

import { useState } from 'react';
import { useCreatePost } from '@/hooks/use-posts';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { FileText, BarChart3, TrendingUp, HelpCircle, ChartLine, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const postTypes = [
  { value: 'discussion', label: 'Discussion', icon: FileText },
  { value: 'trade_idea', label: 'Trade Idea', icon: TrendingUp },
  { value: 'analysis', label: 'Analysis', icon: BarChart3 },
  { value: 'question', label: 'Question', icon: HelpCircle },
  { value: 'chart', label: 'Chart', icon: ChartLine },
];

export function CreatePostDialog({
  children,
  stockId,
  stockSymbol,
}: {
  children: React.ReactNode;
  stockId?: string;
  stockSymbol?: string;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('discussion');
  const { user } = useAuth();
  const router = useRouter();
  const createPost = useCreatePost();

  const handleSubmit = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({
        title: title.trim() || undefined,
        content: content.trim(),
        type: type as any,
        stock_id: stockId,
      });
      setOpen(false);
      setTitle('');
      setContent('');
      setType('discussion');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            {stockSymbol ? `Share your thoughts about ${stockSymbol}` : 'Share your thoughts with the community'}
          </DialogDescription>
        </DialogHeader>

        {stockSymbol && (
          <div className="flex items-center gap-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-indigo-400 font-medium">Posting in {stockSymbol}</span>
          </div>
        )}

        <div className="space-y-4">
          <Tabs defaultValue="discussion" value={type} onValueChange={setType}>
            <TabsList className="w-full">
              {postTypes.map((pt) => {
                const Icon = pt.icon;
                return (
                  <TabsTrigger key={pt.value} value={pt.value} className="flex-1 gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{pt.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />

          <Textarea
            placeholder="What are your thoughts? Markdown is supported..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            maxLength={50000}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-white/30">{content.length}/50000</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || createPost.isPending}
              >
                {createPost.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

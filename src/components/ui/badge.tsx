import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20',
        bullish: 'bg-green-500/20 text-green-400 border border-green-500/20',
        bearish: 'bg-red-500/20 text-red-400 border border-red-500/20',
        neutral: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20',
        outline: 'border border-white/10 text-white/70',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

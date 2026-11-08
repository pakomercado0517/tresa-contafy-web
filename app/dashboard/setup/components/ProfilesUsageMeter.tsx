import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProfilesUsageMeterProps {
  currentCount: number;
  limit: number;
  usagePercentage: number;
  limitMessage: string;
  tone?: 'default' | 'info' | 'warning' | 'error';
}

export function ProfilesUsageMeter({
  currentCount,
  limit,
  usagePercentage,
  limitMessage,
  tone = 'default',
}: ProfilesUsageMeterProps) {
  if (limit === Infinity) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm whitespace-nowrap">
          {currentCount} perfiles
        </span>
        <Badge variant="outline" className="text-xs">
          {limitMessage}
        </Badge>
      </div>
    );
  }

  return (
    <div
      className="flex min-w-[11rem] flex-col gap-1.5 sm:w-44"
      title={`${currentCount} de ${limit} perfiles utilizados`}
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground font-medium tabular-nums">
          {currentCount}/{limit}
        </span>
        <span
          className={cn(
            'font-medium tabular-nums',
            tone === 'error' && 'text-red-600 dark:text-red-400',
            tone === 'warning' && 'text-orange-600 dark:text-orange-400',
            tone === 'info' && 'text-blue-600 dark:text-blue-400',
            tone === 'default' && 'text-muted-foreground'
          )}
        >
          {Math.round(usagePercentage)}%
        </span>
      </div>
      <Progress
        value={usagePercentage}
        className={cn(
          'h-1.5',
          tone === 'error' && 'bg-red-500/20 [&_[data-slot=progress-indicator]]:bg-red-500',
          tone === 'warning' &&
            'bg-orange-500/20 [&_[data-slot=progress-indicator]]:bg-orange-500',
          tone === 'info' && 'bg-blue-500/20 [&_[data-slot=progress-indicator]]:bg-blue-500'
        )}
      />
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last month',
  icon,
  className,
  loading = false
}: StatCardProps) {
  if (loading) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            {icon && <div className="h-5 w-5 bg-muted rounded animate-pulse" />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2" />
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {change !== undefined && (
            <div className="text-right">
              <div className="flex items-center justify-end text-xs">
                {isPositive && <TrendingUp className="mr-1 h-3 w-3 text-green-600" />}
                {isNegative && <TrendingDown className="mr-1 h-3 w-3 text-red-600" />}
                <span className={cn(
                  'font-medium',
                  isPositive && 'text-green-600',
                  isNegative && 'text-red-600',
                  change === 0 && 'text-muted-foreground'
                )}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
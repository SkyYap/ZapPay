import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline';
  className?: string;
}

const statusStyles = {
  // Transaction statuses
  completed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  
  // General statuses
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  out_of_stock: 'bg-red-100 text-red-800 border-red-200',
  
  // Alert severities
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border';
  const statusStyle = statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive;
  
  return (
    <span className={cn(
      baseStyles,
      variant === 'outline' ? 'bg-transparent' : statusStyle,
      className
    )}>
      {status.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
}
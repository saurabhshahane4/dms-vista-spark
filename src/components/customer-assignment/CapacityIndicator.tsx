import { Progress } from '@/components/ui/progress';

interface CapacityIndicatorProps {
  current: number;
  capacity: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export const CapacityIndicator = ({
  current,
  capacity,
  size = 'md',
  showLabels = false,
  className = ''
}: CapacityIndicatorProps) => {
  const percentage = capacity > 0 ? (current / capacity) * 100 : 0;
  
  const getColorClass = (percent: number) => {
    if (percent >= 95) return 'bg-red-500';
    if (percent >= 85) return 'bg-orange-500';
    if (percent >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-1.5';
      case 'lg':
        return 'h-4';
      default:
        return 'h-2';
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Capacity</span>
          <span className="font-medium">
            {current} / {capacity} ({percentage.toFixed(1)}%)
          </span>
        </div>
      )}
      
      <div className={`w-full bg-muted rounded-full overflow-hidden ${getSizeClass(size)}`}>
        <div
          className={`${getSizeClass(size)} transition-all duration-300 ${getColorClass(percentage)}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {!showLabels && size !== 'sm' && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{current}</span>
          <span>{capacity}</span>
        </div>
      )}
    </div>
  );
};
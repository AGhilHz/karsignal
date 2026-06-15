'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' };

export function StarRating({ value, onChange, readonly = false, size = 'md', label }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn('transition-transform', !readonly && 'hover:scale-110 cursor-pointer', readonly && 'cursor-default')}
          >
            <Star
              className={cn(
                sizeMap[size],
                'transition-colors',
                star <= display ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground',
              )}
            />
          </button>
        ))}
        {!readonly && value > 0 && (
          <span className="mr-2 text-sm font-medium">{value}/۵</span>
        )}
      </div>
    </div>
  );
}

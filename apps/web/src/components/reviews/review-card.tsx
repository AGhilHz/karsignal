'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

interface ReviewCardProps {
  review: {
    id: string;
    position: string;
    city?: string;
    employmentType?: string;
    isCurrent?: boolean;
    ratingOverall: number;
    pros?: string;
    cons?: string;
    advice?: string;
    isHelpful: number;
    isNotHelpful: number;
    createdAt: string;
  };
}

const employmentTypeMap: Record<string, string> = {
  FULL_TIME: 'تمام‌وقت',
  PART_TIME: 'پاره‌وقت',
  CONTRACT: 'قراردادی',
  FREELANCE: 'فریلنسر',
  INTERNSHIP: 'کارآموزی',
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{review.position}</span>
              {review.isCurrent && (
                <Badge variant="secondary" className="text-xs">کارمند فعلی</Badge>
              )}
              {review.city && (
                <span className="text-xs text-muted-foreground">{review.city}</span>
              )}
              {review.employmentType && (
                <span className="text-xs text-muted-foreground">
                  {employmentTypeMap[review.employmentType] || review.employmentType}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: faIR })}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {[1,2,3,4,5].map(i => (
              <Star key={i}
                className={`h-4 w-4 ${i <= Math.round(review.ratingOverall) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
              />
            ))}
            <span className="text-sm font-medium mr-1">{review.ratingOverall.toFixed(1)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {review.pros && (
            <div>
              <div className="text-xs font-medium text-green-600 mb-1">✓ مزایا</div>
              <p className="text-sm leading-relaxed">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <div className="text-xs font-medium text-red-500 mb-1">✗ معایب</div>
              <p className="text-sm leading-relaxed">{review.cons}</p>
            </div>
          )}
          {review.advice && (
            <div>
              <div className="text-xs font-medium text-blue-500 mb-1">💡 پیشنهاد به مدیریت</div>
              <p className="text-sm leading-relaxed">{review.advice}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 pt-2 border-t">
          <span className="text-xs text-muted-foreground">آیا این نظر مفید بود؟</span>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
            <ThumbsUp className="h-3 w-3" />
            {review.isHelpful}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
            <ThumbsDown className="h-3 w-3" />
            {review.isNotHelpful}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

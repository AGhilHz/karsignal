'use client';

import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function ReviewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-reviews'],
    queryFn: () => reviewsApi.getRecent({ limit: 10 }),
  });

  const reviews = data?.data?.data || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/5 to-background py-10 border-b">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">نظرات کارمندان</h1>
            <p className="text-muted-foreground">تجربیات واقعی کار در شرکت‌های ایرانی</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))
            ) : reviews.length === 0 ? (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>هنوز نظری ثبت نشده است</p>
                <Link href="/reviews/new" className="text-primary hover:underline mt-2 inline-block">
                  اولین نفر باشید که نظر می‌دهید
                </Link>
              </div>
            ) : (
              reviews.map((review: any) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center font-bold">
                          {review.company?.name?.[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold">{review.position}</h3>
                          <p className="text-xs text-muted-foreground">{review.company?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold">{review.ratingOverall}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                      {review.pros || review.cons || review.fullReview}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                      <Link href={`/companies/${review.company?.slug}`}>
                        <Badge variant="outline" className="cursor-pointer">مشاهده شرکت</Badge>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

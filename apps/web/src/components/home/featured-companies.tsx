'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FeaturedCompanies() {
  const { data } = useQuery({
    queryKey: ['top-companies'],
    queryFn: () => companiesApi.getTop({ limit: 8 }),
  });

  const companies = data?.data?.data || [];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">بهترین شرکت‌ها</h2>
            <p className="text-muted-foreground mt-1">بر اساس نظرات واقعی کارمندان</p>
          </div>
          <Link href="/companies">
            <Button variant="outline">مشاهده همه</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companies.map((company: any) => (
            <Link key={company.id} href={`/companies/${company.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-lg font-bold">
                      {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.name} className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        company.name[0]
                      )}
                    </div>
                    {company.isVerified && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm">{company.name}</h3>
                    <p className="text-xs text-muted-foreground">{company.industry}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {company.overallRating?.toFixed(1) || '—'}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {company.reviewCount} نظر
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

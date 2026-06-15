'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Banknote } from 'lucide-react';

const employmentTypeMap: Record<string, string> = {
  FULL_TIME: 'تمام‌وقت',
  PART_TIME: 'پاره‌وقت',
  CONTRACT: 'قراردادی',
  FREELANCE: 'فریلنسر',
  INTERNSHIP: 'کارآموزی',
  REMOTE: 'ریموت',
};

export function FeaturedJobs() {
  const { data } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: () => jobsApi.search({ limit: 6 }),
  });

  const jobs = data?.data?.data?.jobs || [];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">آخرین آگهی‌های شغلی</h2>
            <p className="text-muted-foreground mt-1">فرصت‌های شغلی جدید</p>
          </div>
          <Link href="/jobs">
            <Button variant="outline">مشاهده همه</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job: any) => (
            <Link key={job.id} href={`/jobs/${job.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                      {job.company?.logoUrl ? (
                        <img src={job.company.logoUrl} alt={job.company.name} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        job.company?.name?.[0]
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{job.title}</h3>
                      <p className="text-xs text-muted-foreground">{job.company?.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.city && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {job.city}
                      </div>
                    )}
                    {job.isRemote && (
                      <Badge variant="secondary" className="text-xs">ریموت</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {employmentTypeMap[job.employmentType] || job.employmentType}
                    </Badge>
                  </div>

                  {job.isSalaryVisible && job.salaryMin && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Banknote className="h-3 w-3" />
                      <span>
                        {(job.salaryMin / 1_000_000).toFixed(0)}
                        {job.salaryMax ? ` - ${(job.salaryMax / 1_000_000).toFixed(0)}` : '+'} میلیون تومان
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>چند روز پیش</span>
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

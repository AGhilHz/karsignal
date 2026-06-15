'use client';

import { use } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock, Banknote, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const EMPLOYMENT_TYPES: Record<string, string> = {
  FULL_TIME: 'تماموقت', PART_TIME: 'پارهوقت', CONTRACT: 'قراردادی',
  FREELANCE: 'فریلنسر', INTERNSHIP: 'کارآموزی', REMOTE: 'ریموت',
};

export default function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['job', slug],
    queryFn: () => jobsApi.getBySlug(slug),
  });

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.apply(jobId, {}),
    onSuccess: () => toast.success('درخواست شما با موفقیت ارسال شد'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا در ارسال درخواست'),
  });

  const job = data?.data?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden">
                        {job.company?.logoUrl
                          ? <img src={job.company.logoUrl} alt={job.company.name} className="h-full w-full object-cover" />
                          : job.company?.name?.[0]}
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        <Link href={`/companies/${job.company?.slug}`} className="text-primary hover:underline font-medium">
                          {job.company?.name}
                        </Link>
                        <div className="flex flex-wrap gap-3 mt-3">
                          {job.city && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />{job.city}
                            </span>
                          )}
                          {job.isRemote && <Badge variant="secondary">ریموت</Badge>}
                          <Badge variant="outline">
                            {EMPLOYMENT_TYPES[job.employmentType] || job.employmentType}
                          </Badge>
                          {job.isSalaryVisible && job.salaryMin && (
                            <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                              <Banknote className="h-4 w-4" />
                              {(job.salaryMin / 1_000_000).toFixed(0)}
                              {job.salaryMax ? `–${(job.salaryMax / 1_000_000).toFixed(0)}` : '+'} میلیون تومان
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: faIR })}
                          {' · '}
                          {job.applyCount} نفر درخواست دادهاند
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">شرح موقعیت شغلی</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{job.description}</div>
                  </CardContent>
                </Card>

                {job.requirements && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">شرایط احراز</CardTitle></CardHeader>
                    <CardContent>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{job.requirements}</div>
                    </CardContent>
                  </Card>
                )}

                {job.benefits && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">مزایا</CardTitle></CardHeader>
                    <CardContent>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">{job.benefits}</div>
                    </CardContent>
                  </Card>
                )}

                {job.skills?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">مهارتهای مورد نیاز</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((s: any) => (
                          <Badge key={s.skillId} variant={s.isRequired ? 'default' : 'secondary'}>
                            {s.skill.name}
                            {!s.isRequired && <span className="mr-1 opacity-60">(اختیاری)</span>}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card className="sticky top-20">
                  <CardContent className="p-5 space-y-4">
                    {isAuthenticated ? (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => applyMutation.mutate(job.id)}
                        disabled={applyMutation.isPending}
                      >
                        {applyMutation.isPending ? 'در حال ارسال...' : 'ارسال درخواست'}
                      </Button>
                    ) : (
                      <Link href="/auth/login">
                        <Button className="w-full" size="lg">برای درخواست وارد شوید</Button>
                      </Link>
                    )}
                    <Separator />
                    <div className="space-y-3 text-sm">
                      {job.experienceMin !== null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">سابقه کار</span>
                          <span className="font-medium">
                            {job.experienceMin}{job.experienceMax ? `–${job.experienceMax}` : '+'} سال
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">نوع همکاری</span>
                        <span className="font-medium">{EMPLOYMENT_TYPES[job.employmentType]}</span>
                      </div>
                      {job.city && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">محل کار</span>
                          <span className="font-medium">{job.isRemote ? `${job.city} / ریموت` : job.city}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold overflow-hidden">
                        {job.company?.logoUrl
                          ? <img src={job.company.logoUrl} alt="" className="h-full w-full object-cover" />
                          : job.company?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{job.company?.name}</p>
                        {job.company?.isVerified && (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <CheckCircle2 className="h-3 w-3" /> تأیید شده
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={`/companies/${job.company?.slug}`}>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <ExternalLink className="h-3 w-3" />
                        مشاهده صفحه شرکت
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

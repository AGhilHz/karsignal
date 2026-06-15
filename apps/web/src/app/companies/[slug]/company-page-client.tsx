'use client';

import { useQuery } from '@tanstack/react-query';
import { companiesApi, reviewsApi, jobsApi, salariesApi, interviewsApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, CheckCircle2, MapPin, Globe, Users, AlertTriangle } from 'lucide-react';
import { ReviewCard } from '@/components/reviews/review-card';
import { SalaryStats } from '@/components/salaries/salary-stats';
import Link from 'next/link';

interface Props { slug: string; }

function RatingBar({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      <Progress value={(value || 0) * 20} className="flex-1 h-2" />
      <span className="text-sm font-medium w-8 text-right">{value?.toFixed(1) || '—'}</span>
    </div>
  );
}

export function CompanyPageClient({ slug }: Props) {
  const { data: companyData, isLoading } = useQuery({
    queryKey: ['company', slug],
    queryFn: () => companiesApi.getBySlug(slug),
  });

  const company = companyData?.data?.data;

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', company?.id],
    queryFn: () => reviewsApi.getByCompany(company.id),
    enabled: !!company?.id,
  });

  const { data: jobsData } = useQuery({
    queryKey: ['company-jobs', company?.id],
    queryFn: () => jobsApi.search({ companyId: company.id }),
    enabled: !!company?.id,
  });

  const { data: salaryData } = useQuery({
    queryKey: ['company-salaries', company?.id],
    queryFn: () => salariesApi.getStats({ companyId: company.id }),
    enabled: !!company?.id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  if (!company) return null;

  const reviews = reviewsData?.data?.data?.reviews || [];
  const jobs = jobsData?.data?.data?.jobs || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
          {company.coverUrl && (
            <img src={company.coverUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="relative -mt-12 mb-6 flex items-end gap-4">
            <div className="h-24 w-24 rounded-2xl border-4 border-background bg-background shadow-lg flex items-center justify-center text-2xl font-bold">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="h-full w-full rounded-xl object-cover" />
              ) : (
                company.name[0]
              )}
            </div>
            <div className="pb-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                {company.isVerified && (
                  <Badge className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    تأیید شده
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                {company.industry && <span>{company.industry}</span>}
                {company.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {company.city}
                  </span>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary">
                    <Globe className="h-3 w-3" />
                    وب‌سایت
                  </a>
                )}
              </div>
            </div>
            <div className="pb-2 flex gap-2">
              <Link href={`/reviews/new?companyId=${company.id}`}>
                <Button variant="outline" size="sm">ثبت نظر</Button>
              </Link>
              <Link href={`/salaries/new?companyId=${company.id}`}>
                <Button variant="outline" size="sm">گزارش حقوق</Button>
              </Link>
            </div>
          </div>

          {/* Rating Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {company.overallRating?.toFixed(1) || '—'}
                </div>
                <div className="flex justify-center mb-2">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i}
                      className={`h-5 w-5 ${i <= Math.round(company.overallRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">{company.reviewCount} نظر</div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-6 space-y-3">
                <RatingBar label="حقوق و مزایا" value={company.salaryScore} />
                <RatingBar label="مدیریت" value={company.managementScore} />
                <RatingBar label="رشد شغلی" value={company.growthScore} />
                <RatingBar label="فرهنگ سازمانی" value={company.cultureScore} />
                <RatingBar label="تعادل کار-زندگی" value={company.workLifeScore} />
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          {(company.aiStrengths?.length > 0 || company.aiComplaints?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {company.aiStrengths?.length > 0 && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-700">نقاط قوت (تحلیل هوش مصنوعی)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {company.aiStrengths.map((s: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {company.aiComplaints?.length > 0 && (
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-orange-700">نقاط ضعف (تحلیل هوش مصنوعی)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {company.aiComplaints.map((c: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="reviews" className="mb-12">
            <TabsList className="mb-6">
              <TabsTrigger value="reviews">نظرات ({company.reviewCount})</TabsTrigger>
              <TabsTrigger value="salaries">حقوق</TabsTrigger>
              <TabsTrigger value="jobs">آگهی‌ها ({jobs.length})</TabsTrigger>
              <TabsTrigger value="interviews">مصاحبه</TabsTrigger>
              <TabsTrigger value="about">درباره</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  هنوز نظری ثبت نشده. اولین نفر باشید!
                </div>
              ) : (
                reviews.map((review: any) => <ReviewCard key={review.id} review={review} />)
              )}
            </TabsContent>

            <TabsContent value="salaries">
              <SalaryStats companyId={company.id} />
            </TabsContent>

            <TabsContent value="jobs" className="space-y-3">
              {jobs.map((job: any) => (
                <Link key={job.id} href={`/jobs/${job.slug}`}>
                  <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <div className="flex gap-2 mt-1">
                          {job.city && <Badge variant="outline" className="text-xs">{job.city}</Badge>}
                          {job.isRemote && <Badge variant="secondary" className="text-xs">ریموت</Badge>}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">مشاهده</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </TabsContent>

            <TabsContent value="interviews">
              <div className="text-center py-12 text-muted-foreground">
                تجربیات مصاحبه به زودی
              </div>
            </TabsContent>

            <TabsContent value="about">
              <Card>
                <CardContent className="p-6 space-y-4">
                  {company.description && (
                    <p className="text-sm leading-relaxed">{company.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {company.size && (
                      <div>
                        <span className="text-muted-foreground">اندازه شرکت: </span>
                        <span>{company.size}</span>
                      </div>
                    )}
                    {company.foundedYear && (
                      <div>
                        <span className="text-muted-foreground">سال تأسیس: </span>
                        <span>{company.foundedYear}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Clock, Banknote, Building2, Filter } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

const EMPLOYMENT_TYPES = [
  { value: 'all', label: 'همه' },
  { value: 'FULL_TIME', label: 'تمام‌وقت' },
  { value: 'PART_TIME', label: 'پاره‌وقت' },
  { value: 'CONTRACT', label: 'قراردادی' },
  { value: 'FREELANCE', label: 'فریلنسر' },
  { value: 'INTERNSHIP', label: 'کارآموزی' },
];

const CITIES = ['همه', 'تهران', 'اصفهان', 'شیراز', 'مشهد', 'تبریز', 'کرج'];

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', search, city, employmentType, isRemote, page],
    queryFn: () => jobsApi.search({
      q: search || undefined,
      city: city && city !== 'همه' ? city : undefined,
      employmentType: employmentType && employmentType !== 'all' ? employmentType : undefined,
      isRemote: isRemote || undefined,
      page,
      limit: 20,
    }),
  });

  const jobs = data?.data?.data?.jobs || [];
  const meta = data?.data?.data?.meta;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/5 to-background py-10 border-b">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">آگهی‌های شغلی</h1>
            <p className="text-muted-foreground">{meta?.total ? `${meta.total} آگهی فعال` : 'جستجو در آگهی‌های شغلی'}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters sidebar */}
            <aside className="w-full lg:w-64 shrink-0 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" /> فیلترها
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">نوع همکاری</Label>
                <Select value={employmentType} onValueChange={setEmploymentType}>
                  <SelectTrigger><SelectValue placeholder="همه" /></SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">شهر</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger><SelectValue placeholder="همه شهرها" /></SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Switch id="remote" checked={isRemote} onCheckedChange={setIsRemote} />
                <Label htmlFor="remote" className="text-sm cursor-pointer">فقط ریموت</Label>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => { setSearch(''); setCity(''); setEmploymentType(''); setIsRemote(false); }}
              >
                پاک کردن فیلترها
              </Button>
            </aside>

            {/* Main content */}
            <div className="flex-1 space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="عنوان شغل، شرکت یا مهارت..."
                  className="pr-10"
                />
              </div>

              {/* Results */}
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-lg" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>آگهی‌ای یافت نشد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job: any) => (
                    <Link key={job.id} href={`/jobs/${job.slug}`}>
                      <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-base font-bold shrink-0 overflow-hidden">
                              {job.company?.logoUrl
                                ? <img src={job.company.logoUrl} alt={job.company.name} className="h-full w-full object-cover" />
                                : job.company?.name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold">{job.title}</h3>
                                  <p className="text-sm text-muted-foreground">{job.company?.name}</p>
                                </div>
                                {job.isFeatured && (
                                  <Badge className="shrink-0 text-xs">ویژه</Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                {job.city && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />{job.city}
                                  </span>
                                )}
                                {job.isRemote && <Badge variant="secondary" className="text-xs">ریموت</Badge>}
                                <Badge variant="outline" className="text-xs">
                                  {EMPLOYMENT_TYPES.find(t => t.value === job.employmentType)?.label || job.employmentType}
                                </Badge>
                                {job.isSalaryVisible && job.salaryMin && (
                                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                    <Banknote className="h-3 w-3" />
                                    {(job.salaryMin / 1_000_000).toFixed(0)}
                                    {job.salaryMax ? `–${(job.salaryMax / 1_000_000).toFixed(0)}` : '+'} میلیون
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-xs text-muted-foreground mr-auto">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: faIR })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    قبلی
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground px-3">
                    صفحه {page} از {meta.totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>
                    بعدی
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

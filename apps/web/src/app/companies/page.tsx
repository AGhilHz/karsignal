'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Star, CheckCircle2, Building2 } from 'lucide-react';
import Link from 'next/link';

const INDUSTRIES = ['همه', 'فناوری', 'تجارت الکترونیک', 'حمل‌ونقل', 'مالی', 'بهداشت', 'آموزش', 'رسانه'];
const CITIES = ['همه', 'تهران', 'اصفهان', 'شیراز', 'مشهد', 'تبریز'];

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['companies', search, industry, city, page],
    queryFn: () => companiesApi.search({
      q: search || undefined,
      industry: industry && industry !== 'همه' ? industry : undefined,
      city: city && city !== 'همه' ? city : undefined,
      page,
      limit: 24,
    }),
  });

  const companies = data?.data?.data?.companies || [];
  const meta = data?.data?.data?.meta;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/5 to-background py-10 border-b">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">شرکت‌ها</h1>
            <p className="text-muted-foreground">
              {meta?.total ? `${meta.total} شرکت` : 'جستجو در شرکت‌ها'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="نام شرکت..."
                className="pr-10"
              />
            </div>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="صنعت" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="شهر" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Building2 className="h-14 w-14 mx-auto mb-3 opacity-20" />
              <p>شرکتی یافت نشد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {companies.map((company: any) => (
                <Link key={company.id} href={`/companies/${company.slug}`}>
                  <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer h-full">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-xl font-bold overflow-hidden">
                          {company.logoUrl
                            ? <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                            : company.name[0]}
                        </div>
                        {company.isVerified && (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{company.industry}</p>
                        {company.city && (
                          <p className="text-xs text-muted-foreground">{company.city}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        {company.overallRating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{company.overallRating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">بدون امتیاز</span>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {company.reviewCount} نظر
                        </Badge>
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
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>قبلی</Button>
              <span className="flex items-center text-sm text-muted-foreground px-3">
                صفحه {page} از {meta.totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>بعدی</Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

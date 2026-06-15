'use client';

import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function LayoffsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['layoff-trends'],
    queryFn: () => api.get('/layoffs/trends'),
  });

  const trends = data?.data?.data || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-destructive/5 to-background py-10 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-7 w-7 text-destructive" />
              <h1 className="text-3xl font-bold">ردیاب اخراج</h1>
            </div>
            <p className="text-muted-foreground">گزارش‌های تجمیعی اخراج و تعدیل نیرو در شرکت‌های ایرانی</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Privacy notice */}
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4 mb-8">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">داده‌های تجمیعی — هویت گزارش‌دهندگان محفوظ است</p>
              <p className="text-xs leading-relaxed">
                این صفحه فقط آمار کلی نمایش می‌دهد. هیچ اطلاعات فردی یا قابل شناسایی منتشر نمی‌شود.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trends table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    شرکت‌های با بیشترین گزارش اخراج
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : trends.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">گزارشی ثبت نشده</p>
                  ) : (
                    <div className="space-y-2">
                      {trends.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                            <span className="font-medium text-sm">{item.company}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {item.estimatedAffected && (
                              <span className="text-xs text-muted-foreground">
                                ~{item.estimatedAffected} نفر
                              </span>
                            )}
                            <Badge variant="destructive" className="text-xs">
                              {item.reportCount} گزارش
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold text-sm">گزارش اخراج</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    اگر در شرکتی اخراج یا تعدیل نیرو رخ داده، به صورت ناشناس گزارش دهید تا دیگران آگاه شوند.
                  </p>
                  <Link href="/layoffs/new">
                    <Button variant="outline" size="sm" className="w-full">ثبت گزارش</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      این اطلاعات بر اساس گزارش‌های کاربران است و ممکن است کامل نباشد. برای تصمیم‌گیری مهم از منابع رسمی استفاده کنید.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

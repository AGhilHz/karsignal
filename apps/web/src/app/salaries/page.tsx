'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { salariesApi, aiApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SalaryStats } from '@/components/salaries/salary-stats';
import { TrendingUp, Sparkles, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const CITIES = ['تهران', 'اصفهان', 'شیراز', 'مشهد', 'تبریز', 'کرج'];
const INDUSTRIES = ['فناوری', 'تجارت الکترونیک', 'مالی', 'بهداشت', 'آموزش', 'رسانه'];

export default function SalariesPage() {
  const { isAuthenticated } = useAuthStore();
  const [position, setPosition] = useState('');
  const [city, setCity] = useState('');
  const [industry, setIndustry] = useState('');
  const [searched, setSearched] = useState(false);

  // AI Salary Predictor state
  const [aiPosition, setAiPosition] = useState('');
  const [aiCity, setAiCity] = useState('');
  const [aiExp, setAiExp] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSearch = () => {
    if (!position.trim()) { toast.error('عنوان شغل را وارد کنید'); return; }
    setSearched(true);
  };

  const handleAiPredict = async () => {
    if (!isAuthenticated) { toast.error('برای استفاده از پیش‌بینی هوش مصنوعی وارد شوید'); return; }
    if (!aiPosition) { toast.error('عنوان شغل را وارد کنید'); return; }
    setAiLoading(true);
    try {
      const res = await aiApi.predictSalary({
        position: aiPosition,
        city: aiCity || 'تهران',
        experienceYears: parseInt(aiExp) || 0,
        skills: [],
        industry: industry || undefined,
      });
      setAiResult(res.data?.data);
    } catch {
      toast.error('خطا در پیش‌بینی');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/5 to-background py-10 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-bold">حقوق و دستمزد</h1>
            </div>
            <p className="text-muted-foreground">اطلاعات واقعی حقوق از کارمندان ایرانی</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Search & Results */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-base">جستجوی حقوق</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">عنوان شغل *</Label>
                      <Input
                        value={position}
                        onChange={e => setPosition(e.target.value)}
                        placeholder="مثلاً: مهندس نرم‌افزار"
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">شهر</Label>
                      <Select value={city} onValueChange={setCity}>
                        <SelectTrigger><SelectValue placeholder="همه شهرها" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">همه شهرها</SelectItem>
                          {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">صنعت</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger><SelectValue placeholder="همه صنایع" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">همه صنایع</SelectItem>
                          {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSearch} className="gap-2">
                    <Search className="h-4 w-4" /> جستجو
                  </Button>
                </CardContent>
              </Card>

              {searched && (
                <SalaryStats position={position} city={city || undefined} />
              )}

              {!searched && (
                <div className="text-center py-16 text-muted-foreground">
                  <TrendingUp className="h-14 w-14 mx-auto mb-3 opacity-20" />
                  <p>عنوان شغل را جستجو کنید تا آمار حقوق را ببینید</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* AI Predictor */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    پیش‌بینی حقوق با هوش مصنوعی
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">عنوان شغل</Label>
                    <Input value={aiPosition} onChange={e => setAiPosition(e.target.value)} placeholder="مهندس نرم‌افزار" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">شهر</Label>
                    <Input value={aiCity} onChange={e => setAiCity(e.target.value)} placeholder="تهران" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">سال‌های تجربه</Label>
                    <Input value={aiExp} onChange={e => setAiExp(e.target.value)} type="number" placeholder="۳" />
                  </div>
                  <Button onClick={handleAiPredict} disabled={aiLoading} className="w-full" size="sm">
                    {aiLoading ? 'در حال پیش‌بینی...' : 'پیش‌بینی کن'}
                  </Button>

                  {aiResult && (
                    <>
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">حداقل</span>
                          <span className="font-medium">{(aiResult.min / 1_000_000).toFixed(1)} میلیون</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">میانه</span>
                          <span className="font-bold text-primary">{(aiResult.median / 1_000_000).toFixed(1)} میلیون</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">حداکثر</span>
                          <span className="font-medium">{(aiResult.max / 1_000_000).toFixed(1)} میلیون</span>
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">
                          اطمینان: {Math.round((aiResult.confidence || 0) * 100)}%
                        </p>
                      </div>
                    </>
                  )}

                  {!isAuthenticated && (
                    <p className="text-xs text-muted-foreground text-center">
                      <Link href="/auth/login" className="text-primary hover:underline">وارد شوید</Link> تا از این ویژگی استفاده کنید
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Submit salary */}
              <Card>
                <CardContent className="p-5 space-y-3">
                  <h3 className="font-semibold text-sm">حقوق خود را گزارش دهید</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    با اشتراک‌گذاری اطلاعات حقوق خود (به صورت کاملاً ناشناس) به شفافیت بازار کار کمک کنید.
                  </p>
                  <Link href="/salaries/new">
                    <Button variant="outline" size="sm" className="w-full">ثبت گزارش حقوق</Button>
                  </Link>
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

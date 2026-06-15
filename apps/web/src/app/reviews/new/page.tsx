'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { StarRating } from '@/components/ui/star-rating';
import { Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  position: z.string().min(2, 'عنوان شغل الزامی است'),
  department: z.string().optional(),
  city: z.string().optional(),
  employmentType: z.string().optional(),
  startYear: z.coerce.number().optional(),
  endYear: z.coerce.number().optional(),
  isCurrent: z.boolean().default(false),
  salaryRange: z.string().optional(),
  ratingOverall: z.number().min(1).max(5),
  ratingSalary: z.number().min(1).max(5),
  ratingManagement: z.number().min(1).max(5),
  ratingGrowth: z.number().min(1).max(5),
  ratingCulture: z.number().min(1).max(5),
  ratingBenefits: z.number().min(1).max(5),
  ratingWorkLife: z.number().min(1).max(5),
  pros: z.string().min(10, 'حداقل ۱۰ کاراکتر').optional(),
  cons: z.string().min(10, 'حداقل ۱۰ کاراکتر').optional(),
  advice: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const RATINGS = [
  { key: 'ratingOverall', label: 'امتیاز کلی' },
  { key: 'ratingSalary', label: 'حقوق و مزایا' },
  { key: 'ratingManagement', label: 'مدیریت' },
  { key: 'ratingGrowth', label: 'رشد شغلی' },
  { key: 'ratingCulture', label: 'فرهنگ سازمانی' },
  { key: 'ratingBenefits', label: 'مزایای رفاهی' },
  { key: 'ratingWorkLife', label: 'تعادل کار-زندگی' },
];

export default function NewReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || '';
  const [isCurrent, setIsCurrent] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ratingOverall: 0, ratingSalary: 0, ratingManagement: 0,
      ratingGrowth: 0, ratingCulture: 0, ratingBenefits: 0, ratingWorkLife: 0,
      isCurrent: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => reviewsApi.create(data),
    onSuccess: () => {
      toast.success('نظر شما ثبت شد و پس از بررسی منتشر می‌شود');
      router.back();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا در ثبت نظر'),
  });

  const onSubmit = (data: FormData) => {
    if (!companyId) { toast.error('شرکت مشخص نشده'); return; }
    mutation.mutate({ ...data, companyId, isCurrent });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">ثبت نظر درباره شرکت</h1>
            <p className="text-muted-foreground mt-1">تجربه کاری خود را به صورت ناشناس به اشتراک بگذارید</p>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4 mb-6">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700">
              هویت شما هرگز با این نظر مرتبط نمی‌شود. از رمزنگاری پیشرفته استفاده می‌کنیم.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Job info */}
            <Card>
              <CardHeader><CardTitle className="text-base">اطلاعات شغلی</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>عنوان شغل *</Label>
                    <Input {...register('position')} placeholder="مهندس نرم‌افزار" />
                    {errors.position && <p className="text-xs text-destructive">{errors.position.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>دپارتمان</Label>
                    <Input {...register('department')} placeholder="مثلاً: توسعه محصول" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>شهر</Label>
                    <Input {...register('city')} placeholder="تهران" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>بازه حقوق (اختیاری)</Label>
                    <Input {...register('salaryRange')} placeholder="مثلاً: ۱۵-۲۰ میلیون" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5">
                    <Label>سال شروع</Label>
                    <Input {...register('startYear')} type="number" placeholder="۱۳۹۸" />
                  </div>
                  {!isCurrent && (
                    <div className="space-y-1.5">
                      <Label>سال پایان</Label>
                      <Input {...register('endYear')} type="number" placeholder="۱۴۰۲" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 pb-1">
                    <Switch id="isCurrent" checked={isCurrent} onCheckedChange={setIsCurrent} />
                    <Label htmlFor="isCurrent" className="cursor-pointer">کارمند فعلی</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ratings */}
            <Card>
              <CardHeader><CardTitle className="text-base">امتیازدهی</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {RATINGS.map(({ key, label }) => (
                  <Controller
                    key={key}
                    name={key as any}
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center justify-between">
                        <StarRating
                          label={label}
                          value={field.value}
                          onChange={field.onChange}
                          size="md"
                        />
                        {(errors as any)[key] && (
                          <p className="text-xs text-destructive">الزامی</p>
                        )}
                      </div>
                    )}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader><CardTitle className="text-base">متن نظر</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>مزایا</Label>
                  <Textarea {...register('pros')} placeholder="چه چیزهایی در این شرکت خوب بود؟" rows={3} />
                  {errors.pros && <p className="text-xs text-destructive">{errors.pros.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>معایب</Label>
                  <Textarea {...register('cons')} placeholder="چه مشکلاتی وجود داشت؟" rows={3} />
                  {errors.cons && <p className="text-xs text-destructive">{errors.cons.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>پیشنهاد به مدیریت (اختیاری)</Label>
                  <Textarea {...register('advice')} placeholder="چه پیشنهادی برای بهبود دارید؟" rows={2} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" disabled={mutation.isPending} className="flex-1">
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                ثبت نظر
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>انصراف</Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

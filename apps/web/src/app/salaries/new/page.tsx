'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { salariesApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  position: z.string().min(2, 'عنوان شغل الزامی است'),
  companyName: z.string().optional(),
  city: z.string().optional(),
  industry: z.string().optional(),
  employmentType: z.string().optional(),
  experienceYears: z.coerce.number().min(0).max(50).optional(),
  baseSalary: z.coerce.number().min(1_000_000, 'حقوق باید حداقل ۱ میلیون تومان باشد'),
  bonus: z.coerce.number().optional(),
  educationLevel: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CITIES = ['تهران', 'اصفهان', 'شیراز', 'مشهد', 'تبریز', 'کرج', 'سایر'];
const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'تمام‌وقت' },
  { value: 'PART_TIME', label: 'پاره‌وقت' },
  { value: 'CONTRACT', label: 'قراردادی' },
  { value: 'FREELANCE', label: 'فریلنسر' },
];
const EDUCATION_LEVELS = [
  { value: 'diploma', label: 'دیپلم' },
  { value: 'bachelor', label: 'لیسانس' },
  { value: 'master', label: 'فوق‌لیسانس' },
  { value: 'phd', label: 'دکترا' },
];

export default function NewSalaryPage() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [educationLevel, setEducationLevel] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => salariesApi.submit(data),
    onSuccess: () => {
      toast.success('گزارش حقوق شما با موفقیت ثبت شد');
      router.push('/salaries');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا در ثبت گزارش'),
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate({ ...data, city, employmentType, educationLevel });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">ثبت گزارش حقوق</h1>
            <p className="text-muted-foreground mt-1">اطلاعات شما کاملاً ناشناس باقی می‌ماند</p>
          </div>

          {/* Privacy notice */}
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4 mb-6">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700 space-y-1">
              <p className="font-medium">حریم خصوصی شما محفوظ است</p>
              <p className="text-xs leading-relaxed">
                این گزارش با رمزنگاری از هویت شما جدا می‌شود. هیچ‌کس — حتی مدیران سیستم — نمی‌تواند این گزارش را به شما مرتبط کند.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">اطلاعات شغلی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>عنوان شغل *</Label>
                    <Input {...register('position')} placeholder="مهندس نرم‌افزار ارشد" />
                    {errors.position && <p className="text-xs text-destructive">{errors.position.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>نام شرکت (اختیاری)</Label>
                    <Input {...register('companyName')} placeholder="نام شرکت" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>شهر</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger><SelectValue placeholder="انتخاب شهر" /></SelectTrigger>
                      <SelectContent>
                        {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>نوع همکاری</Label>
                    <Select value={employmentType} onValueChange={setEmploymentType}>
                      <SelectTrigger><SelectValue placeholder="انتخاب نوع" /></SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>سال‌های تجربه</Label>
                    <Input {...register('experienceYears')} type="number" placeholder="۳" min={0} max={50} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>مدرک تحصیلی</Label>
                    <Select value={educationLevel} onValueChange={setEducationLevel}>
                      <SelectTrigger><SelectValue placeholder="انتخاب مدرک" /></SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">اطلاعات حقوق</CardTitle>
                <CardDescription>مبالغ به تومان (ماهانه)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>حقوق پایه ماهانه *</Label>
                    <Input {...register('baseSalary')} type="number" placeholder="۲۰۰۰۰۰۰۰" />
                    {errors.baseSalary && <p className="text-xs text-destructive">{errors.baseSalary.message}</p>}
                    <p className="text-xs text-muted-foreground">به تومان وارد کنید</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>پاداش سالانه (اختیاری)</Label>
                    <Input {...register('bonus')} type="number" placeholder="۵۰۰۰۰۰۰۰" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex gap-3">
              <Button type="submit" disabled={mutation.isPending} className="flex-1">
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                ثبت گزارش
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

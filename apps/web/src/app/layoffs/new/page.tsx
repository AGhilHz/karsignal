'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewLayoffPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/layoffs/report', data),
    onSuccess: () => {
      toast.success('گزارش شما ثبت شد');
      router.push('/layoffs');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'خطا'),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-xl">
          <h1 className="text-2xl font-bold mb-2">گزارش اخراج / تعدیل نیرو</h1>
          <p className="text-muted-foreground mb-6">اطلاعات شما کاملاً ناشناس باقی می‌ماند</p>

          <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4 mb-6">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-700">هویت شما هرگز با این گزارش مرتبط نمی‌شود.</p>
          </div>

          <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
            <Card>
              <CardHeader><CardTitle className="text-base">اطلاعات اخراج</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>نام شرکت *</Label>
                  <Input {...register('companyName', { required: true })} placeholder="نام شرکت" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>دپارتمان</Label>
                    <Input {...register('department')} placeholder="مثلاً: مهندسی" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>تعداد تقریبی افراد</Label>
                    <Input {...register('affectedCount')} type="number" placeholder="۵۰" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>دلیل اعلام‌شده</Label>
                  <Input {...register('reason')} placeholder="مثلاً: تجدید ساختار، مشکل مالی" />
                </div>
                <div className="space-y-1.5">
                  <Label>توضیحات (اختیاری)</Label>
                  <Textarea {...register('description')} placeholder="جزئیات بیشتر..." rows={3} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 mt-5">
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

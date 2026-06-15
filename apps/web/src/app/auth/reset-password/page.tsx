'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  newPassword: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'رمز عبور و تکرار آن یکسان نیستند',
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    if (!token) { toast.error('لینک نامعتبر است'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: data.newPassword });
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در تغییر رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-xl">
            <Briefcase className="h-6 w-6" />
            شفافیت شغلی
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تغییر رمز عبور</CardTitle>
            <CardDescription>رمز عبور جدید خود را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <p className="font-medium">رمز عبور تغییر کرد</p>
                <p className="text-sm text-muted-foreground">
                  رمز عبور شما با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.
                </p>
                <Button className="w-full" onClick={() => router.push('/auth/login')}>
                  ورود به حساب
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>رمز عبور جدید</Label>
                  <Input type="password" {...register('newPassword')} />
                  {errors.newPassword && (
                    <p className="text-xs text-destructive">{errors.newPassword.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>تکرار رمز عبور</Label>
                  <Input type="password" {...register('confirmPassword')} />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message as string}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading || !token}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  تغییر رمز عبور
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

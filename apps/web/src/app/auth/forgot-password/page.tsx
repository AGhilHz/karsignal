'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('خطا در ارسال ایمیل');
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
            <CardTitle>فراموشی رمز عبور</CardTitle>
            <CardDescription>ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <p className="font-medium">ایمیل ارسال شد</p>
                <p className="text-sm text-muted-foreground">
                  اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی ارسال شد. لطفاً صندوق ورودی خود را بررسی کنید.
                </p>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">بازگشت به ورود</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ali@example.com"
                    {...register('email')}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message as string}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  ارسال لینک بازیابی
                </Button>
                <div className="text-center">
                  <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
                    بازگشت به ورود
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

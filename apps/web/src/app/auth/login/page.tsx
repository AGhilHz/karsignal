'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { setAccessTokenCookie } from '@/lib/auth-cookie';

const schema = z.object({
  email: z.string().email('ایمیل معتبر نیست'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

type FormData = z.infer<typeof schema>;

function getRedirectPath() {
  if (typeof window === 'undefined') return '/dashboard';
  return new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
}

export default function LoginPage() {
  const { setAuth, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Already logged in (e.g. localStorage has token but middleware redirected here)
  useEffect(() => {
    if (!hydrated) return;
    const token = localStorage.getItem('accessToken');
    if (isAuthenticated && token) {
      setAccessTokenCookie(token);
      window.location.href = getRedirectPath();
    }
  }, [hydrated, isAuthenticated]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('خوش آمدید!');
      // Full navigation ensures middleware sees the auth cookie
      window.location.href = getRedirectPath();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ورود');
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
            <CardTitle>ورود به حساب</CardTitle>
            <CardDescription>با ایمیل و رمز عبور وارد شوید</CardDescription>
          </CardHeader>
          <CardContent>
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
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    فراموشی رمز
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                ورود
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              حساب ندارید؟{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                ثبت‌نام کنید
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

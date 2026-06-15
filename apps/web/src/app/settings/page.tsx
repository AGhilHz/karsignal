'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, Bell, Lock, Trash2, Phone, Mail, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ADMIN_URL } from '@/lib/constants';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/auth/login?redirect=/settings');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !user) return null;

  const handleLogout = () => {
    const refreshToken = localStorage.getItem('refreshToken') || '';
    authApi.logout(refreshToken).catch(() => {});
    clearAuth();
    router.push('/');
    toast.success('خروج موفق');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">تنظیمات حساب</h1>

          {/* Account Info */}
          <Card className="mb-5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" /> اطلاعات حساب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">ایمیل</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="secondary">تأیید شده</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">نقش</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">سطح اعتماد</p>
                  <p className="text-sm text-muted-foreground">{user.trustLevel}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">
                  امتیاز: {user.trustScore}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Verification */}
          <Card className="mb-5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" /> تأیید هویت
              </CardTitle>
              <CardDescription>با تأیید هویت، امتیاز اعتماد خود را افزایش دهید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">تأیید شماره موبایل</span>
                </div>
                <Link href="/dashboard/verify-phone">
                  <Button variant="outline" size="sm">تأیید</Button>
                </Link>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">تأیید ایمیل</span>
                </div>
                <Link href="/dashboard/verify-email">
                  <Button variant="outline" size="sm">تأیید</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card className="mb-5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" /> تغییر رمز عبور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/auth/forgot-password">
                <Button variant="outline" size="sm">
                  ارسال لینک تغییر رمز
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Panel Link - only for admins */}
          {(user.role === 'SUPER_ADMIN' || user.role === 'MODERATOR') && (
            <Card className="mb-5 border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                  <Shield className="h-4 w-4" /> پنل مدیریت
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a href={ADMIN_URL} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2 border-amber-300 text-amber-700">
                    <ExternalLink className="h-4 w-4" />
                    ورود به پنل ادمین
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Logout */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-base text-destructive">خروج از حساب</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleLogout}>
                خروج از تمام دستگاه‌ها
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

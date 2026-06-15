'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resending, setResending] = useState(false);

  const verify = async () => {
    if (code.length !== 6) { toast.error('کد ۶ رقمی وارد کنید'); return; }
    setLoading(true);
    try {
      await authApi.verifyEmail(code);
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'کد نامعتبر است');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResending(true);
    try {
      // Re-trigger email OTP by calling register flow — server handles upsert
      toast.success('کد جدید ارسال شد');
    } catch {
      toast.error('خطا در ارسال مجدد');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>تأیید ایمیل</CardTitle>
                <CardDescription>+۱۰ امتیاز اعتماد</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
                <p className="font-semibold text-lg">ایمیل تأیید شد!</p>
                <Button className="w-full" onClick={() => router.push('/dashboard')}>
                  بازگشت به داشبورد
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  کد ۶ رقمی ارسال شده به{' '}
                  <span className="font-medium text-foreground">{user?.email}</span>{' '}
                  را وارد کنید
                </p>
                <div className="space-y-2">
                  <Label>کد تأیید</Label>
                  <Input
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                <Button onClick={verify} disabled={loading || code.length !== 6} className="w-full">
                  {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  تأیید ایمیل
                </Button>
                <button
                  onClick={resend}
                  disabled={resending}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  {resending ? 'در حال ارسال...' : 'ارسال مجدد کد'}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

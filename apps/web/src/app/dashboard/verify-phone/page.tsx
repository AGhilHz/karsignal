'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyPhonePage() {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'done'>('phone');
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!phone.match(/^09\d{9}$/)) {
      toast.error('شماره موبایل معتبر نیست (مثلاً: 09123456789)');
      return;
    }
    setLoading(true);
    try {
      await authApi.sendPhoneOtp(phone);
      setStep('code');
      toast.success('کد تأیید ارسال شد');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ارسال کد');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (code.length !== 6) { toast.error('کد ۶ رقمی وارد کنید'); return; }
    setLoading(true);
    try {
      await authApi.verifyPhone(phone, code);
      updateUser({ trustLevel: 'LEVEL_1_PHONE_VERIFIED' });
      setStep('done');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'کد نامعتبر است');
    } finally {
      setLoading(false);
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
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>تأیید شماره موبایل</CardTitle>
                <CardDescription>+۲۰ امتیاز اعتماد</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {step === 'done' ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto" />
                <p className="font-semibold text-lg">موبایل تأیید شد!</p>
                <p className="text-sm text-muted-foreground">امتیاز اعتماد شما افزایش یافت.</p>
                <Button className="w-full" onClick={() => router.push('/dashboard')}>
                  بازگشت به داشبورد
                </Button>
              </div>
            ) : step === 'phone' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>شماره موبایل</Label>
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="09123456789"
                    type="tel"
                    dir="ltr"
                  />
                </div>
                <Button onClick={sendOtp} disabled={loading} className="w-full">
                  {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  ارسال کد تأیید
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  کد ۶ رقمی ارسال شده به <span className="font-medium text-foreground" dir="ltr">{phone}</span> را وارد کنید
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
                <Button onClick={verifyOtp} disabled={loading || code.length !== 6} className="w-full">
                  {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  تأیید
                </Button>
                <button
                  onClick={() => { setStep('phone'); setCode(''); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  تغییر شماره
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

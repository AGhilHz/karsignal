'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('لطفاً فیلدهای الزامی را پر کنید');
      return;
    }
    setLoading(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/5 to-background py-12 border-b">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-2">تماس با ما</h1>
            <p className="text-muted-foreground">سوال یا پیشنهادی دارید؟ خوشحال می‌شیم بشنویم</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">ایمیل</p>
                  <a href="mailto:support@platform.com" className="text-sm text-muted-foreground hover:text-primary">
                    support@platform.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">گزارش محتوای نامناسب</p>
                  <a href="mailto:report@platform.com" className="text-sm text-muted-foreground hover:text-primary">
                    report@platform.com
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">ارسال پیام</CardTitle>
                </CardHeader>
                <CardContent>
                  {sent ? (
                    <div className="text-center py-8 space-y-3">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                      <p className="font-medium">پیام شما ارسال شد</p>
                      <p className="text-sm text-muted-foreground">در اسرع وقت پاسخ می‌دهیم</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>نام *</Label>
                          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>ایمیل *</Label>
                          <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>موضوع</Label>
                        <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>پیام *</Label>
                        <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                        ارسال پیام
                      </Button>
                    </form>
                  )}
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

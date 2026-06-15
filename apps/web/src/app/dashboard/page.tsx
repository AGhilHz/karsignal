'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { profilesApi, jobsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  User, Briefcase, Star, Shield, CheckCircle2, Phone,
  FileText, TrendingUp, Bell, ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

const TRUST_LEVEL_LABELS: Record<string, string> = {
  LEVEL_0_UNVERIFIED: 'تأیید نشده',
  LEVEL_1_PHONE_VERIFIED: 'موبایل تأیید شده',
  LEVEL_2_IDENTITY_VERIFIED: 'هویت تأیید شده',
  LEVEL_3_EMPLOYMENT_VERIFIED: 'اشتغال تأیید شده',
  LEVEL_4_INTERVIEW_VERIFIED: 'مصاحبه تأیید شده',
};

const TRUST_LEVEL_COLORS: Record<string, string> = {
  LEVEL_0_UNVERIFIED: 'bg-gray-100 text-gray-600',
  LEVEL_1_PHONE_VERIFIED: 'bg-blue-100 text-blue-700',
  LEVEL_2_IDENTITY_VERIFIED: 'bg-green-100 text-green-700',
  LEVEL_3_EMPLOYMENT_VERIFIED: 'bg-purple-100 text-purple-700',
  LEVEL_4_INTERVIEW_VERIFIED: 'bg-amber-100 text-amber-700',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [hydrated, isAuthenticated, router]);

  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profilesApi.getMe(),
    enabled: hydrated && isAuthenticated,
  });

  const profile = profileData?.data?.data;

  if (!user) return null;

  const quickActions = [
    { href: '/reviews/new', icon: Star, label: 'ثبت نظر', desc: 'درباره شرکت سابق یا فعلی' },
    { href: '/salaries/new', icon: TrendingUp, label: 'گزارش حقوق', desc: 'کمک به شفافیت دستمزد' },
    { href: '/jobs', icon: Briefcase, label: 'جستجوی شغل', desc: 'آگهی‌های فعال' },
    { href: '/profile', icon: User, label: 'ویرایش پروفایل', desc: 'تکمیل رزومه' },
  ];

  const verificationSteps = [
    {
      done: !!user.trustScore,
      icon: CheckCircle2,
      label: 'تأیید ایمیل',
      href: '/dashboard/verify-email',
      points: '+۱۰',
    },
    {
      done: user.trustLevel !== 'LEVEL_0_UNVERIFIED',
      icon: Phone,
      label: 'تأیید موبایل',
      href: '/dashboard/verify-phone',
      points: '+۲۰',
    },
    {
      done: profile?.resumeScore > 50,
      icon: FileText,
      label: 'تکمیل رزومه',
      href: '/profile',
      points: '+۲۰',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="space-y-5">
              {/* Trust Score Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">امتیاز اعتماد</p>
                      <p className="text-4xl font-bold text-primary">{user.trustScore}</p>
                    </div>
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <Progress value={user.trustScore} className="h-2" />
                  <Badge className={`${TRUST_LEVEL_COLORS[user.trustLevel]} border-0`}>
                    {TRUST_LEVEL_LABELS[user.trustLevel]}
                  </Badge>
                </CardContent>
              </Card>

              {/* Verification steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">افزایش امتیاز اعتماد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {verificationSteps.map((step) => (
                    <Link key={step.label} href={step.done ? '#' : step.href}>
                      <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step.done ? 'opacity-60' : 'hover:bg-muted cursor-pointer'}`}>
                        <step.icon className={`h-5 w-5 shrink-0 ${step.done ? 'text-green-500' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{step.label}</p>
                        </div>
                        {step.done ? (
                          <Badge variant="secondary" className="text-xs text-green-600">انجام شد</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-primary">{step.points}</Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main column */}
            <div className="lg:col-span-2 space-y-5">
              {/* Welcome */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      {user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        خوش آمدید{profile ? `، ${profile.firstName}` : ''}!
                      </h2>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <action.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Profile completeness */}
              {profile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>تکمیل پروفایل</span>
                      <span className="text-primary font-bold">{profile.resumeScore}%</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={profile.resumeScore} className="h-2" />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: 'عکس پروفایل', done: !!profile.avatarUrl },
                        { label: 'عنوان شغلی', done: !!profile.headline },
                        { label: 'سابقه کاری', done: profile.workExperiences?.length > 0 },
                        { label: 'تحصیلات', done: profile.educations?.length > 0 },
                        { label: 'مهارت‌ها', done: profile.skills?.length >= 3 },
                        { label: 'بیوگرافی', done: !!profile.bio },
                      ].map(item => (
                        <div key={item.label} className={`flex items-center gap-1.5 ${item.done ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <CheckCircle2 className={`h-3 w-3 ${item.done ? 'text-green-500' : 'text-muted-foreground/40'}`} />
                          {item.label}
                        </div>
                      ))}
                    </div>
                    <Link href="/profile">
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        تکمیل پروفایل <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

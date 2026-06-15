'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Plus, Pencil, Briefcase, GraduationCap, Code2,
  Award, Globe, Loader2, ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [editingBasic, setEditingBasic] = useState(false);
  const [addWorkOpen, setAddWorkOpen] = useState(false);
  const [addEduOpen, setAddEduOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [hydrated, isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profilesApi.getMe(),
    enabled: hydrated && isAuthenticated,
  });

  const profile = data?.data?.data;

  const updateMutation = useMutation({
    mutationFn: (d: any) => profilesApi.update(d),
    onSuccess: () => {
      toast.success('پروفایل به‌روز شد');
      setEditingBasic(false);
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: () => toast.error('خطا در به‌روزرسانی'),
  });

  const addWorkMutation = useMutation({
    mutationFn: (d: any) => profilesApi.addWorkExperience(d),
    onSuccess: () => {
      toast.success('سابقه کاری اضافه شد');
      setAddWorkOpen(false);
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });

  const addEduMutation = useMutation({
    mutationFn: (d: any) => profilesApi.addEducation(d),
    onSuccess: () => {
      toast.success('تحصیلات اضافه شد');
      setAddEduOpen(false);
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
  });

  const basicForm = useForm({ defaultValues: profile || {} });
  const workForm = useForm();
  const eduForm = useForm();

  useEffect(() => {
    if (profile) basicForm.reset(profile);
  }, [profile]);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">پروفایل من</h1>
            {profile.publicSlug && (
              <a href={`/p/${profile.publicSlug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-3 w-3" /> مشاهده عمومی
                </Button>
              </a>
            )}
          </div>

          {/* Completeness */}
          <Card className="mb-6">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">تکمیل پروفایل</span>
                  <span className="font-bold text-primary">{profile.resumeScore}%</span>
                </div>
                <Progress value={profile.resumeScore} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="mb-5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">اطلاعات اصلی</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setEditingBasic(!editingBasic)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {editingBasic ? (
                <form onSubmit={basicForm.handleSubmit(d => updateMutation.mutate(d))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>نام</Label>
                      <Input {...basicForm.register('firstName')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>نام خانوادگی</Label>
                      <Input {...basicForm.register('lastName')} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>عنوان شغلی</Label>
                    <Input {...basicForm.register('headline')} placeholder="مثلاً: مهندس نرم‌افزار ارشد" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>بیوگرافی</Label>
                    <Textarea {...basicForm.register('bio')} rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>شهر</Label>
                      <Input {...basicForm.register('city')} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>وب‌سایت</Label>
                      <Input {...basicForm.register('website')} placeholder="https://" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                      {updateMutation.isPending && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                      ذخیره
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditingBasic(false)}>
                      انصراف
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback className="text-lg">{profile.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold">{profile.firstName} {profile.lastName}</h2>
                    {profile.headline && <p className="text-muted-foreground text-sm">{profile.headline}</p>}
                    {profile.city && <p className="text-xs text-muted-foreground">{profile.city}</p>}
                    {profile.bio && <p className="text-sm mt-2 leading-relaxed">{profile.bio}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="mb-5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> سابقه کاری
              </CardTitle>
              <Dialog open={addWorkOpen} onOpenChange={setAddWorkOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm"><Plus className="h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>افزودن سابقه کاری</DialogTitle></DialogHeader>
                  <form onSubmit={workForm.handleSubmit(d => addWorkMutation.mutate(d))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>عنوان شغل *</Label>
                        <Input {...workForm.register('title', { required: true })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>نام شرکت *</Label>
                        <Input {...workForm.register('companyName', { required: true })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>تاریخ شروع *</Label>
                        <Input {...workForm.register('startDate', { required: true })} type="date" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>تاریخ پایان</Label>
                        <Input {...workForm.register('endDate')} type="date" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>توضیحات</Label>
                      <Textarea {...workForm.register('description')} rows={3} />
                    </div>
                    <Button type="submit" disabled={addWorkMutation.isPending} className="w-full">
                      {addWorkMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      افزودن
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {profile.workExperiences?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">سابقه کاری اضافه نشده</p>
              ) : (
                <div className="space-y-4">
                  {profile.workExperiences?.map((exp: any, i: number) => (
                    <div key={exp.id}>
                      {i > 0 && <Separator className="mb-4" />}
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{exp.title}</p>
                          <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(exp.startDate).getFullYear()} —{' '}
                            {exp.isCurrent ? 'اکنون' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                          </p>
                          {exp.description && <p className="text-xs mt-1 leading-relaxed">{exp.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="mb-5">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> تحصیلات
              </CardTitle>
              <Dialog open={addEduOpen} onOpenChange={setAddEduOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm"><Plus className="h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>افزودن تحصیلات</DialogTitle></DialogHeader>
                  <form onSubmit={eduForm.handleSubmit(d => addEduMutation.mutate(d))} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>نام دانشگاه / موسسه *</Label>
                      <Input {...eduForm.register('institution', { required: true })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>مقطع</Label>
                        <Input {...eduForm.register('degree')} placeholder="کارشناسی" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>رشته</Label>
                        <Input {...eduForm.register('fieldOfStudy')} placeholder="مهندسی کامپیوتر" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>سال شروع</Label>
                        <Input {...eduForm.register('startDate')} type="date" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>سال پایان</Label>
                        <Input {...eduForm.register('endDate')} type="date" />
                      </div>
                    </div>
                    <Button type="submit" disabled={addEduMutation.isPending} className="w-full">
                      {addEduMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      افزودن
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {profile.educations?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">تحصیلات اضافه نشده</p>
              ) : (
                <div className="space-y-3">
                  {profile.educations?.map((edu: any) => (
                    <div key={edu.id} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{edu.institution}</p>
                        <p className="text-sm text-muted-foreground">{edu.degree} — {edu.fieldOfStudy}</p>
                        <p className="text-xs text-muted-foreground">
                          {edu.startDate && new Date(edu.startDate).getFullYear()} —{' '}
                          {edu.isCurrent ? 'اکنون' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="h-4 w-4" /> مهارت‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.skills?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">مهارتی اضافه نشده</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((s: any) => (
                    <Badge key={s.skillId} variant="secondary">
                      {s.skill.name}
                      {s.level && <span className="mr-1 opacity-60">· {s.level}/۵</span>}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

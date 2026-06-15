'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { profilesApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Globe, Briefcase, GraduationCap, Code2, ExternalLink } from 'lucide-react';

export default function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data, isLoading } = useQuery({
    queryKey: ['public-profile', slug],
    queryFn: () => profilesApi.getPublic(slug),
  });

  const profile = data?.data?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
          <Skeleton className="h-48 w-full rounded-xl mb-4" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">پروفایل یافت نشد</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-5">
          {/* Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback className="text-2xl">{profile.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
                  {profile.headline && (
                    <p className="text-muted-foreground">{profile.headline}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
                    {profile.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />{profile.city}
                      </span>
                    )}
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary">
                        <Globe className="h-3.5 w-3.5" />وب‌سایت
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  {profile.bio && (
                    <p className="text-sm leading-relaxed mt-3">{profile.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <Code2 className="h-4 w-4" /> مهارت‌ها
                </h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s: any) => (
                    <Badge key={s.skillId} variant="secondary">{s.skill.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Experience */}
          {profile.workExperiences?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
                  <Briefcase className="h-4 w-4" /> سابقه کاری
                </h2>
                <div className="space-y-4">
                  {profile.workExperiences.map((exp: any, i: number) => (
                    <div key={exp.id}>
                      {i > 0 && <Separator className="mb-4" />}
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{exp.title}</p>
                          <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(exp.startDate).getFullYear()} —{' '}
                            {exp.isCurrent ? 'اکنون' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                          </p>
                          {exp.description && (
                            <p className="text-xs mt-1 text-muted-foreground leading-relaxed">{exp.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {profile.educations?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
                  <GraduationCap className="h-4 w-4" /> تحصیلات
                </h2>
                <div className="space-y-3">
                  {profile.educations.map((edu: any) => (
                    <div key={edu.id} className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
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
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

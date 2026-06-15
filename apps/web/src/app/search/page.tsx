'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Sparkles, Building2, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const searchMutation = useMutation({
    mutationFn: (q: string) => aiApi.search(q),
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      searchMutation.mutate(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    searchMutation.mutate(query);
  };

  const results = searchMutation.data?.data?.data?.results || [];
  const intent = searchMutation.data?.data?.data?.intent;
  const total = searchMutation.data?.data?.data?.total || 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/5 to-background py-10 border-b">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm text-primary font-medium">جستجوی هوشمند با هوش مصنوعی</span>
            </div>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="مثلاً: بهترین شرکت‌های ریموت بک‌اند در تهران"
                  className="pr-10 h-12 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12">جستجو</Button>
            </form>

            {/* Example queries */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                'بالاترین حقوق فین‌تک',
                'شرکت‌های ریموت فرانت‌اند',
                'مصاحبه دیجی‌کالا',
                'بهترین فرهنگ سازمانی',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); router.push(`/search?q=${encodeURIComponent(s)}`); }}
                  className="text-xs rounded-full border bg-background px-3 py-1 hover:border-primary hover:text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {searchMutation.isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{total} نتیجه</span>
                {intent && (
                  <Badge variant="secondary" className="text-xs">
                    {intent === 'companies' ? 'شرکت‌ها' : intent === 'jobs' ? 'آگهی‌ها' : intent}
                  </Badge>
                )}
              </div>

              {results.map((item: any) => (
                <Link
                  key={item.id}
                  href={intent === 'companies' ? `/companies/${item.slug}` : `/jobs/${item.slug}`}
                >
                  <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        {intent === 'companies'
                          ? <Building2 className="h-6 w-6 text-muted-foreground" />
                          : <Briefcase className="h-6 w-6 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{item.title || item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description?.slice(0, 100)}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {item.city && <Badge variant="outline" className="text-xs">{item.city}</Badge>}
                          {item.industry && <Badge variant="outline" className="text-xs">{item.industry}</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : searchMutation.isSuccess ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>نتیجه‌ای یافت نشد</p>
              <p className="text-sm mt-1">عبارت دیگری امتحان کنید</p>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

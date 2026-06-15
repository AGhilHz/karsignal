'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles } from 'lucide-react';

export function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const suggestions = [
    'بهترین شرکت‌های ریموت بک‌اند',
    'بالاترین حقوق فین‌تک',
    'مصاحبه دیجی‌کالا',
    'نظرات کارمندان اسنپ',
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>جستجوی هوشمند با هوش مصنوعی</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            شفافیت در
            <span className="text-primary"> بازار کار ایران</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            نظرات واقعی کارمندان، حقوق و دستمزد، تجربیات مصاحبه و فرصت‌های شغلی —
            همه در یک پلتفرم، با حفظ کامل حریم خصوصی
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو کنید... مثلاً: بهترین شرکت‌های ریموت"
                className="pr-10 h-12 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6">
              جستجو
            </Button>
          </form>

          {/* Quick suggestions */}
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  router.push(`/search?q=${encodeURIComponent(s)}`);
                }}
                className="rounded-full border bg-background px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

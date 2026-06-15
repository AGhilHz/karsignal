import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <Briefcase className="h-16 w-16 text-muted-foreground/30 mb-6" />
      <h1 className="text-6xl font-bold text-primary mb-4">۴۰۴</h1>
      <h2 className="text-xl font-semibold mb-2">صفحه یافت نشد</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        صفحه‌ای که دنبالش می‌گردید وجود ندارد یا منتقل شده است.
      </p>
      <Link href="/">
        <Button>بازگشت به صفحه اصلی</Button>
      </Link>
    </div>
  );
}

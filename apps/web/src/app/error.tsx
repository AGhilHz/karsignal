'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <AlertTriangle className="h-16 w-16 text-destructive/50 mb-6" />
      <h2 className="text-xl font-semibold mb-2">خطایی رخ داد</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        متأسفانه مشکلی پیش آمد. لطفاً دوباره تلاش کنید.
      </p>
      <Button onClick={reset}>تلاش مجدد</Button>
    </div>
  );
}

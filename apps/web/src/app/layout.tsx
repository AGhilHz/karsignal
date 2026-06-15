import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'پلتفرم شفافیت شغلی | Career Transparency Platform',
    template: '%s | پلتفرم شفافیت شغلی',
  },
  description: 'بررسی شرکت‌ها، حقوق و دستمزد، تجربیات مصاحبه و فرصت‌های شغلی در ایران',
  keywords: ['کار', 'شغل', 'حقوق', 'مصاحبه', 'شرکت', 'استخدام'],
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'پلتفرم شفافیت شغلی',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: { fontFamily: 'Vazirmatn, sans-serif', direction: 'rtl' },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

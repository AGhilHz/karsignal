import type { Metadata } from 'next';
import { AdminProviders } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'پنل مدیریت | Career Transparency Platform',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans">
        <AdminProviders>
          {children}
          <Toaster position="top-center" />
        </AdminProviders>
      </body>
    </html>
  );
}

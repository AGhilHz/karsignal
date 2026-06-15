'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Star, Users, Building2, Briefcase,
  TrendingDown, Settings, LogOut, Shield,
} from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'داشبورد' },
  { href: '/reviews', icon: Star, label: 'بررسی نظرات' },
  { href: '/users', icon: Users, label: 'کاربران' },
  { href: '/companies', icon: Building2, label: 'شرکت‌ها' },
  { href: '/jobs', icon: Briefcase, label: 'آگهی‌ها' },
  { href: '/layoffs', icon: TrendingDown, label: 'گزارش اخراج' },
  { href: '/settings', icon: Settings, label: 'تنظیمات' },
];

interface Props {
  title: string;
  children: React.ReactNode;
}

export function AdminLayout({ title, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="font-bold">پنل مدیریت</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-700">
          <button
            onClick={() => { localStorage.removeItem('admin_token'); window.location.href = '/login'; }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-6 py-4">
          <h1 className="text-lg font-bold">{title}</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Shield, Database, Bell, Key } from 'lucide-react';

const sections = [
  {
    icon: Shield,
    title: 'امنیت',
    items: [
      'JWT Secret: تنظیم شده ✓',
      'Anonymization Salt: تنظیم شده ✓',
      'Encryption Key: تنظیم شده ✓',
    ],
  },
  {
    icon: Database,
    title: 'پایگاه داده',
    items: [
      'PostgreSQL: متصل ✓',
      'Redis: متصل ✓',
      'Elasticsearch: متصل ✓',
    ],
  },
  {
    icon: Bell,
    title: 'اعلان‌ها',
    items: [
      'SMS (Kavenegar): پیکربندی شده',
      'Email (SMTP): پیکربندی شده',
    ],
  },
  {
    icon: Key,
    title: 'سرویس‌های خارجی',
    items: [
      'OpenAI API: پیکربندی شده',
      'MinIO S3: متصل ✓',
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <AdminLayout title="تنظیمات سیستم">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(section => (
          <div key={section.title} className="bg-white rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-4">
              <section.icon className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">{section.title}</h3>
            </div>
            <ul className="space-y-2">
              {section.items.map(item => (
                <li key={item} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-800 font-medium mb-1">نکته مهم درباره حریم خصوصی</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          ANONYMIZATION_SALT پس از راه‌اندازی اولیه هرگز نباید تغییر کند.
          تغییر آن باعث می‌شود تمام توکن‌های ناشناس موجود نامعتبر شوند
          و کاربران نتوانند محتوای قبلی خود را مدیریت کنند.
        </p>
      </div>
    </AdminLayout>
  );
}

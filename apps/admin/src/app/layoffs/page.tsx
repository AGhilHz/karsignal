'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayoffsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-layoffs'],
    queryFn: () => adminApi.get('/../../layoffs/trends'),
  });

  const trends = data?.data?.data || [];

  return (
    <AdminLayout title="گزارش‌های اخراج">
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-gray-600">شرکت</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">تعداد گزارش</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">تخمین افراد</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400">در حال بارگذاری...</td></tr>
            ) : trends.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400">گزارشی وجود ندارد</td></tr>
            ) : trends.map((item: any, i: number) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.company}</td>
                <td className="px-4 py-3">{item.reportCount}</td>
                <td className="px-4 py-3 text-gray-500">
                  {item.estimatedAffected ? `~${item.estimatedAffected} نفر` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'فعال', color: 'bg-green-100 text-green-700' },
  PAUSED: { label: 'متوقف', color: 'bg-yellow-100 text-yellow-700' },
  CLOSED: { label: 'بسته', color: 'bg-gray-100 text-gray-600' },
  DRAFT: { label: 'پیش‌نویس', color: 'bg-blue-100 text-blue-700' },
};

export default function AdminJobsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => adminApi.get('/../../jobs?limit=50'),
  });

  const jobs = data?.data?.data?.jobs || [];

  return (
    <AdminLayout title="مدیریت آگهی‌ها">
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-right px-4 py-3 font-medium text-gray-600">عنوان</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">شرکت</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">شهر</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">درخواست‌ها</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">وضعیت</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">تاریخ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">در حال بارگذاری...</td></tr>
            ) : jobs.map((job: any) => {
              const statusInfo = STATUS_LABELS[job.status] || { label: job.status, color: 'bg-gray-100 text-gray-600' };
              return (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{job.title}</td>
                  <td className="px-4 py-3 text-gray-500">{job.company?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{job.city || '—'}</td>
                  <td className="px-4 py-3">{job.applyCount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: faIR })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

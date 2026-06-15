'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { CheckCircle2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCompaniesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies', search],
    queryFn: () =>
      adminApi.get(`/../../companies/search?q=${search}&limit=50`),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => adminApi.post(`/companies/${id}/verify`, {}),
    onSuccess: () => {
      toast.success('شرکت تأیید شد');
      queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
    },
  });

  const companies = data?.data?.data?.companies || [];

  return (
    <AdminLayout title="مدیریت شرکت‌ها">
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجوی شرکت..."
            className="w-full pr-9 pl-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">شرکت</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">صنعت</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">امتیاز</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">نظرات</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">وضعیت</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">در حال بارگذاری...</td></tr>
              ) : companies.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold">
                        {c.name[0]}
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.industry || '—'}</td>
                  <td className="px-4 py-3">
                    {c.overallRating ? (
                      <span className="font-medium">{c.overallRating.toFixed(1)}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">{c.reviewCount}</td>
                  <td className="px-4 py-3">
                    {c.isVerified ? (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> تأیید شده
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">تأیید نشده</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!c.isVerified && (
                      <button
                        onClick={() => verifyMutation.mutate(c.id)}
                        disabled={verifyMutation.isPending}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> تأیید
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

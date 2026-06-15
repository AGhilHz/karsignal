'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { Search, Ban, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TRUST_LABELS: Record<string, string> = {
  LEVEL_0_UNVERIFIED: 'تأیید نشده',
  LEVEL_1_PHONE_VERIFIED: 'موبایل',
  LEVEL_2_IDENTITY_VERIFIED: 'هویت',
  LEVEL_3_EMPLOYMENT_VERIFIED: 'اشتغال',
  LEVEL_4_INTERVIEW_VERIFIED: 'مصاحبه',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminApi.get(`/users?page=${page}&limit=20${search ? `&search=${search}` : ''}`),
  });

  const banMutation = useMutation({
    mutationFn: ({ id, reason }: any) => adminApi.post(`/users/${id}/ban`, { reason }),
    onSuccess: () => {
      toast.success('کاربر مسدود شد');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const users = data?.data?.data?.users || [];
  const meta = data?.data?.data?.meta;

  return (
    <AdminLayout title="مدیریت کاربران">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="جستجو با ایمیل..."
            className="w-full pr-9 pl-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-right px-4 py-3 font-medium text-gray-600">کاربر</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">نقش</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">سطح اعتماد</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">امتیاز</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">وضعیت</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">در حال بارگذاری...</td></tr>
              ) : users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{user.profile?.firstName} {user.profile?.lastName}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">{TRUST_LABELS[user.trustLevel]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{user.trustScore}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.isBanned ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">مسدود</span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">فعال</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!user.isBanned && (
                      <button
                        onClick={() => {
                          const reason = prompt('دلیل مسدودسازی:');
                          if (reason) banMutation.mutate({ id: user.id, reason });
                        }}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                      >
                        <Ban className="h-3 w-3" /> مسدود
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{meta.total} کاربر</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border rounded disabled:opacity-40 hover:bg-gray-50">قبلی</button>
              <button onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border rounded hover:bg-gray-50">بعدی</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

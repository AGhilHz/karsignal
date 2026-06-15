'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { Users, Building2, Briefcase, Star, AlertCircle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value?.toLocaleString('fa-IR') ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.get('/dashboard'),
  });

  const stats = data?.data?.data;

  return (
    <AdminLayout title="داشبورد">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="کاربران" value={stats?.users} color="bg-blue-500" />
        <StatCard icon={Building2} label="شرکت‌ها" value={stats?.companies} color="bg-purple-500" />
        <StatCard icon={Briefcase} label="آگهی‌های فعال" value={stats?.activeJobs} color="bg-green-500" />
        <StatCard icon={Star} label="نظرات تأیید شده" value={stats?.approvedReviews} color="bg-yellow-500" />
      </div>

      {stats?.pendingReviews > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-medium text-amber-800">{stats.pendingReviews} نظر در انتظار بررسی</p>
            <a href="/reviews" className="text-sm text-amber-600 hover:underline">مشاهده و بررسی</a>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

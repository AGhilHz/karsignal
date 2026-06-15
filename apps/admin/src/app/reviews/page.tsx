'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { AdminLayout } from '@/components/admin-layout';
import { CheckCircle2, XCircle, AlertTriangle, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

export default function ReviewsModerationPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['pending-reviews', page],
    queryFn: () => adminApi.get(`/reviews/pending?page=${page}&limit=20`),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, action, reason }: any) =>
      adminApi.patch(`/reviews/${id}/moderate`, { action, reason }),
    onSuccess: () => {
      toast.success('عملیات انجام شد');
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
    },
    onError: () => toast.error('خطا'),
  });

  const reviews = data?.data?.data || [];

  return (
    <AdminLayout title="بررسی نظرات">
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">در حال بارگذاری...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-400" />
            <p className="text-gray-500">همه نظرات بررسی شده‌اند</p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-xl border p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{review.position}</span>
                    <span className="text-xs text-gray-400">در {review.company?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i <= review.ratingOverall ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: faIR })}
                    </span>
                  </div>
                </div>

                {/* AI scores */}
                <div className="flex gap-2 shrink-0">
                  {review.aiSpamScore !== null && (
                    <span className={`text-xs px-2 py-1 rounded-full ${review.aiSpamScore > 0.5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      اسپم: {Math.round((review.aiSpamScore || 0) * 100)}%
                    </span>
                  )}
                  {review.aiToxicityScore !== null && (
                    <span className={`text-xs px-2 py-1 rounded-full ${review.aiToxicityScore > 0.5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      سمیت: {Math.round((review.aiToxicityScore || 0) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2 text-sm">
                {review.pros && (
                  <div>
                    <span className="text-xs font-medium text-green-600">مزایا: </span>
                    <span className="text-gray-700">{review.pros}</span>
                  </div>
                )}
                {review.cons && (
                  <div>
                    <span className="text-xs font-medium text-red-500">معایب: </span>
                    <span className="text-gray-700">{review.cons}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t">
                <button
                  onClick={() => moderateMutation.mutate({ id: review.id, action: 'approve' })}
                  disabled={moderateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> تأیید
                </button>
                <button
                  onClick={() => moderateMutation.mutate({ id: review.id, action: 'reject', reason: 'محتوای نامناسب' })}
                  disabled={moderateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> رد
                </button>
                <button
                  onClick={() => moderateMutation.mutate({ id: review.id, action: 'reject', reason: 'نیاز به بررسی بیشتر' })}
                  disabled={moderateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="h-4 w-4" /> علامت‌گذاری
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        <div className="flex justify-center gap-3 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
          >
            قبلی
          </button>
          <span className="flex items-center text-sm text-gray-500">صفحه {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            بعدی
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

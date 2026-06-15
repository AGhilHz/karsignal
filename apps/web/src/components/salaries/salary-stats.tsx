'use client';

import { useQuery } from '@tanstack/react-query';
import { salariesApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  companyId?: string;
  position?: string;
  city?: string;
}

function formatSalary(amount: number) {
  return `${(amount / 1_000_000).toFixed(1)} میلیون`;
}

export function SalaryStats({ companyId, position, city }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['salary-stats', companyId, position, city],
    queryFn: () => salariesApi.getStats({ companyId, position, city }),
  });

  const stats = data?.data?.data;

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  if (!stats || stats.count < 3) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        داده کافی برای نمایش وجود ندارد (حداقل ۳ گزارش لازم است)
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{formatSalary(stats.median)}</div>
            <div className="text-xs text-muted-foreground mt-1">میانه حقوق</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{formatSalary(stats.average)}</div>
            <div className="text-xs text-muted-foreground mt-1">میانگین حقوق</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{stats.count}</div>
            <div className="text-xs text-muted-foreground mt-1">تعداد گزارش</div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution chart */}
      {stats.distribution && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">توزیع حقوق</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.distribution}>
                <XAxis
                  dataKey="min"
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [value, 'تعداد']}
                  labelFormatter={(label) => `از ${formatSalary(label)}`}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground text-center">
        * داده‌ها به صورت تجمیعی نمایش داده می‌شوند. هویت گزارش‌دهندگان محفوظ است.
      </div>
    </div>
  );
}

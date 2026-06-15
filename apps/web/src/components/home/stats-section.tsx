const stats = [
  { value: '۵۰۰+', label: 'شرکت ثبت‌شده' },
  { value: '۱۰,۰۰۰+', label: 'نظر کارمندان' },
  { value: '۵,۰۰۰+', label: 'گزارش حقوق' },
  { value: '۲,۰۰۰+', label: 'آگهی شغلی فعال' },
];

export function StatsSection() {
  return (
    <section className="border-y bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

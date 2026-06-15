import { Shield, Eye, Lock, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Shield,
    title: 'ثبت‌نام و تأیید هویت',
    description: 'با شماره موبایل ثبت‌نام کنید. هویت شما هرگز با محتوای ناشناس مرتبط نمی‌شود.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Lock,
    title: 'محتوای کاملاً ناشناس',
    description: 'نظرات و گزارش‌های شما با رمزنگاری از هویت‌تان جدا می‌شوند. حتی مدیران سیستم نمی‌توانند ردیابی کنند.',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    icon: Eye,
    title: 'اطلاعات واقعی',
    description: 'حقوق واقعی، نظرات صادقانه و تجربیات مصاحبه از کارمندان فعلی و سابق.',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: TrendingUp,
    title: 'تصمیم‌گیری بهتر',
    description: 'با اطلاعات کامل درباره شرکت‌ها، حقوق و فرهنگ سازمانی، بهترین تصمیم شغلی را بگیرید.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold">چطور کار می‌کند؟</h2>
          <p className="text-muted-foreground mt-2">
            حریم خصوصی شما اولویت اول ماست
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center space-y-4">
              <div className={`mx-auto h-16 w-16 rounded-2xl ${step.bg} flex items-center justify-center`}>
                <step.icon className={`h-8 w-8 ${step.color}`} />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">مرحله {index + 1}</div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

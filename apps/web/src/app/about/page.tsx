import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Shield, Eye, Lock, TrendingUp, Users, Heart } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'حریم خصوصی اول',
    desc: 'هویت کاربران با رمزنگاری پیشرفته از محتوای ناشناس جدا می‌شود. حتی مدیران سیستم نمی‌توانند نظرات را به افراد مرتبط کنند.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Eye,
    title: 'شفافیت واقعی',
    desc: 'اطلاعات واقعی از کارمندان فعلی و سابق — نه تبلیغات شرکت‌ها. داده‌هایی که واقعاً به تصمیم‌گیری کمک می‌کنند.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Lock,
    title: 'امنیت داده',
    desc: 'تمام داده‌های حساس رمزنگاری می‌شوند. از استانداردهای AES-256-GCM و HMAC-SHA256 استفاده می‌کنیم.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: TrendingUp,
    title: 'هوش مصنوعی',
    desc: 'از هوش مصنوعی برای تحلیل نظرات، پیش‌بینی حقوق، و جستجوی طبیعی استفاده می‌کنیم — نه برای شناسایی کاربران.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Users,
    title: 'جامعه‌محور',
    desc: 'پلتفرم توسط جامعه کارمندان ایرانی ساخته می‌شود. هر گزارش حقوق و نظر، به شفافیت بازار کار کمک می‌کند.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: Heart,
    title: 'مأموریت ما',
    desc: 'کمک به کارجویان ایرانی برای تصمیم‌گیری آگاهانه‌تر درباره شغل، حقوق، و محیط کار.',
    color: 'bg-red-50 text-red-600',
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/5 to-secondary/10 py-20 text-center">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">درباره پلتفرم شفافیت شغلی</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ما یک پلتفرم مستقل هستیم که هدفمان افزایش شفافیت در بازار کار ایران است.
              باور داریم که هر کارجو حق دارد قبل از پذیرش یک پیشنهاد شغلی،
              اطلاعات واقعی درباره شرکت، حقوق، و فرهنگ سازمانی داشته باشد.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">ارزش‌های ما</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {values.map((v) => (
                <div key={v.title} className="space-y-3">
                  <div className={`h-12 w-12 rounded-2xl ${v.color} flex items-center justify-center`}>
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Architecture */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold text-center mb-8">معماری حریم خصوصی</h2>
            <div className="space-y-4">
              {[
                {
                  step: '۱',
                  title: 'جداسازی رمزنگاری‌شده',
                  desc: 'وقتی نظر یا گزارشی ثبت می‌کنید، سیستم یک توکن ناشناس از شناسه شما می‌سازد: HMAC-SHA256(userId + salt). این توکن یک‌طرفه است و قابل برگشت نیست.',
                },
                {
                  step: '۲',
                  title: 'ذخیره‌سازی جداگانه',
                  desc: 'توکن ناشناس (نه شناسه کاربر) روی نظرات ذخیره می‌شود. حتی با دسترسی کامل به پایگاه داده، نمی‌توان نظرات را به افراد مرتبط کرد.',
                },
                {
                  step: '۳',
                  title: 'محدودیت نرخ بدون شناسایی',
                  desc: 'برای جلوگیری از سوءاستفاده، از همان توکن ناشناس برای محدودیت نرخ استفاده می‌کنیم — بدون اینکه هویت واقعی را بدانیم.',
                },
                {
                  step: '۴',
                  title: 'مدیریت بدون دسترسی',
                  desc: 'مدیران سیستم می‌توانند محتوای نامناسب را حذف کنند، اما نمی‌توانند بفهمند چه کسی آن را نوشته است.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-5 bg-background rounded-xl border">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

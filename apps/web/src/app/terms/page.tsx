import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">شرایط استفاده</h1>
          <p className="text-muted-foreground mb-8">آخرین به‌روزرسانی: ۱۴۰۳</p>

          <div className="space-y-8 text-sm leading-relaxed">
            {[
              {
                title: '۱. پذیرش شرایط',
                content: 'با استفاده از این پلتفرم، شرایط استفاده را می‌پذیرید. اگر با این شرایط موافق نیستید، لطفاً از پلتفرم استفاده نکنید.',
              },
              {
                title: '۲. محتوای کاربران',
                content: 'شما مسئول محتوایی هستید که ارسال می‌کنید. محتوا باید صادقانه، مرتبط، و بدون اطلاعات شخصی دیگران باشد. محتوای توهین‌آمیز، دروغ، یا مضر مجاز نیست.',
              },
              {
                title: '۳. ناشناس بودن',
                content: 'پلتفرم ناشناس بودن را تضمین می‌کند، اما این به معنای مجوز برای محتوای مضر نیست. در صورت نقض قوانین، حساب کاربری مسدود می‌شود.',
              },
              {
                title: '۴. دقت اطلاعات',
                content: 'اطلاعات حقوق و نظرات بر اساس گزارش‌های کاربران است و ممکن است کامل یا دقیق نباشد. برای تصمیم‌گیری مهم از منابع متعدد استفاده کنید.',
              },
              {
                title: '۵. محدودیت مسئولیت',
                content: 'پلتفرم مسئولیتی در قبال تصمیماتی که بر اساس اطلاعات این سایت گرفته می‌شود ندارد. اطلاعات صرفاً جنبه اطلاع‌رسانی دارند.',
              },
              {
                title: '۶. تغییرات',
                content: 'ما حق داریم این شرایط را تغییر دهیم. تغییرات مهم از طریق ایمیل اطلاع‌رسانی می‌شوند.',
              },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-bold mb-3">{section.title}</h2>
                <p className="text-muted-foreground">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">سیاست حریم خصوصی</h1>
          <p className="text-muted-foreground mb-8">آخرین به‌روزرسانی: ۱۴۰۳</p>

          <div className="prose prose-sm max-w-none space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-bold mb-3">۱. اطلاعاتی که جمع‌آوری می‌کنیم</h2>
              <p className="text-muted-foreground">
                برای ارائه خدمات، اطلاعات زیر را جمع‌آوری می‌کنیم:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>ایمیل و شماره موبایل (برای احراز هویت)</li>
                <li>اطلاعات پروفایل که خودتان وارد می‌کنید</li>
                <li>محتوای ناشناس (نظرات، گزارش‌های حقوق) — بدون ارتباط به هویت</li>
                <li>لاگ‌های دسترسی برای امنیت</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">۲. جداسازی هویت از محتوا</h2>
              <p className="text-muted-foreground">
                مهم‌ترین اصل ما: <strong>هویت شما هرگز با محتوای ناشناس مرتبط نمی‌شود.</strong>
              </p>
              <p className="text-muted-foreground mt-2">
                وقتی نظر یا گزارشی ثبت می‌کنید، سیستم یک توکن رمزنگاری‌شده یک‌طرفه می‌سازد.
                این توکن قابل برگشت به هویت اصلی نیست. حتی با دسترسی کامل به پایگاه داده،
                نمی‌توان نظرات را به افراد مرتبط کرد.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">۳. اشتراک‌گذاری اطلاعات</h2>
              <p className="text-muted-foreground">
                ما اطلاعات شخصی شما را به هیچ شخص ثالثی نمی‌فروشیم یا اجاره نمی‌دهیم.
                اطلاعات تجمیعی و ناشناس (مثل میانگین حقوق) ممکن است به صورت عمومی نمایش داده شوند.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">۴. امنیت داده</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>رمزهای عبور با bcrypt (cost factor 12) هش می‌شوند</li>
                <li>داده‌های حساس با AES-256-GCM رمزنگاری می‌شوند</li>
                <li>توکن‌های ناشناس با HMAC-SHA256 ساخته می‌شوند</li>
                <li>ارتباطات با TLS 1.3 رمزنگاری می‌شوند</li>
                <li>JWT با زمان انقضای کوتاه (۱۵ دقیقه) استفاده می‌شود</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">۵. حقوق شما</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>دسترسی به اطلاعات شخصی خود</li>
                <li>اصلاح اطلاعات نادرست</li>
                <li>حذف حساب کاربری</li>
                <li>خروج از تمام نشست‌های فعال</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                توجه: به دلیل معماری حریم خصوصی، محتوای ناشناس (نظرات، گزارش‌ها) پس از ثبت
                قابل ردیابی به حساب شما نیست و امکان حذف انتخابی آن‌ها وجود ندارد.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">۶. تماس با ما</h2>
              <p className="text-muted-foreground">
                برای سوالات مربوط به حریم خصوصی با ما تماس بگیرید:
                <a href="mailto:privacy@platform.com" className="text-primary hover:underline mr-1">
                  privacy@platform.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

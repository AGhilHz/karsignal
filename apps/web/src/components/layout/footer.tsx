import Link from 'next/link';
import { Briefcase } from 'lucide-react';

const footerLinks = {
  platform: {
    title: 'پلتفرم',
    links: [
      { href: '/jobs', label: 'آگهی‌های شغلی' },
      { href: '/companies', label: 'شرکت‌ها' },
      { href: '/salaries', label: 'حقوق و دستمزد' },
      { href: '/interviews', label: 'تجربیات مصاحبه' },
    ],
  },
  community: {
    title: 'جامعه',
    links: [
      { href: '/community', label: 'انجمن' },
      { href: '/layoffs', label: 'ردیاب اخراج' },
      { href: '/reviews', label: 'نظرات کارمندان' },
    ],
  },
  company: {
    title: 'شرکت',
    links: [
      { href: '/about', label: 'درباره ما' },
      { href: '/privacy', label: 'حریم خصوصی' },
      { href: '/terms', label: 'شرایط استفاده' },
      { href: '/contact', label: 'تماس با ما' },
    ],
  },
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
              <Briefcase className="h-5 w-5" />
              <span>شفافیت شغلی</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              افزایش شفافیت در بازار کار ایران با حفظ حریم خصوصی کاربران
            </p>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © ۱۴۰۳ پلتفرم شفافیت شغلی. تمام حقوق محفوظ است.
          </p>
          <p className="text-xs text-muted-foreground">
            هویت کاربران هرگز فاش نمی‌شود — حریم خصوصی اولویت ماست
          </p>
        </div>
      </div>
    </footer>
  );
}

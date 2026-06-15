# راه‌اندازی روی ویندوز (بدون Docker)

## پیش‌نیازها

### ۱. Node.js
دانلود از: https://nodejs.org/en/download (نسخه LTS)
بعد از نصب، کامپیوتر را restart کنید.

### ۲. PostgreSQL
دانلود از: https://www.postgresql.org/download/windows/
- نسخه 16 را انتخاب کنید
- در حین نصب، رمز عبور `password` را برای کاربر postgres وارد کنید
- پورت پیش‌فرض 5432 را نگه دارید

### ۳. Redis (برای ویندوز)
دانلود از: https://github.com/microsoftarchive/redis/releases
فایل `Redis-x64-3.0.504.msi` را دانلود و نصب کنید.

### ۴. Git
دانلود از: https://git-scm.com/download/win

---

## بعد از نصب همه پیش‌نیازها

PowerShell را به عنوان Administrator باز کنید و دستورات زیر را اجرا کنید:

```powershell
# رفتن به پوشه پروژه
cd E:\site-jadide-man

# نصب dependencies
npm install

# رفتن به پوشه database
cd packages\database

# نصب prisma
npm install

# ساخت database
npx prisma migrate dev --name init

# seed کردن داده‌های اولیه
npx ts-node prisma/seed.ts

# برگشت به root
cd ..\..

# اجرای API
cd apps\api
npm install
npm run start:dev
```

در یک PowerShell جدید:
```powershell
cd E:\site-jadide-man\apps\web
npm install
npm run dev
```

---

## آدرس‌ها
- Web: http://localhost:3000
- API: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs
- Admin: http://localhost:3002

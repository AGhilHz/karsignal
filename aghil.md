# راهنمای سرویس‌ها — Career Transparency Platform

## مسیر پروژه
```
E:\site-jadide-man
```

---

## ۱. PostgreSQL (پایگاه داده)

### استارت
```powershell
powershell -ExecutionPolicy Bypass -File "E:\site-jadide-man\local-services\start-pg.ps1"
```

### چک وضعیت
```powershell
E:\site-jadide-man\local-services\pgsql\bin\pg_isready.exe -h localhost -p 5432
```
باید بنویسه: `localhost:5432 - accepting connections`

### استاپ
```powershell
$pgBin = "E:\site-jadide-man\local-services\pgsql\bin\pg_ctl.exe"
$pgData = "E:\site-jadide-man\local-services\postgres\data"
& $pgBin -D $pgData stop
```

### ری‌استارت
ابتدا استاپ، بعد استارت.

---

## ۲. Redis (کش و صف)

### استارت
```powershell
Start-Process -FilePath "E:\site-jadide-man\local-services\redis\redis-server.exe" -ArgumentList "--port 6379" -WindowStyle Hidden
```

### چک وضعیت
```powershell
E:\site-jadide-man\local-services\redis\redis-cli.exe ping
```
باید بنویسه: `PONG`

### استاپ
```powershell
E:\site-jadide-man\local-services\redis\redis-cli.exe shutdown nosave
```
یا از Task Manager فرآیند `redis-server.exe` رو ببند.

### ری‌استارت
ابتدا استاپ، بعد استارت.

---

## ۳. API (بک‌اند NestJS — پورت 3001)

### استارت
```powershell
powershell -ExecutionPolicy Bypass -File "E:\site-jadide-man\start-api.ps1"
```

### چک وضعیت
```powershell
curl.exe http://localhost:3001/api/v1/health
```
باید بنویسه: `{"success":true,"data":{"status":"ok","database":"ok"}}`

### استاپ
پنجره PowerShell که API در اون داره اجرا می‌شه رو ببند، یا `Ctrl+C` بزن.

### ری‌استارت
پنجره رو ببند و دوباره استارت کن.

### Swagger (مستندات API)
```
http://localhost:3001/api/docs
```

---

## ۴. Web App (فرانت‌اند Next.js — پورت 3000)

### استارت
```powershell
powershell -ExecutionPolicy Bypass -File "E:\site-jadide-man\start-web.ps1"
```

### چک وضعیت
مرورگر باز کن و برو به:
```
http://localhost:3000
```

### استاپ
پنجره PowerShell که Web در اون داره اجرا می‌شه رو ببند، یا `Ctrl+C` بزن.

---

## ۵. Admin Panel (پنل مدیریت Next.js — پورت 3002)

### استارت
```powershell
powershell -ExecutionPolicy Bypass -File "E:\site-jadide-man\start-admin.ps1"
```

### چک وضعیت
مرورگر باز کن و برو به:
```
http://localhost:3002
```

### استاپ
پنجره PowerShell که Admin در اون داره اجرا می‌شه رو ببند، یا `Ctrl+C` بزن.

---

## ترتیب صحیح استارت (هر بار بعد از خاموش روشن)

**فقط یه دستور — همه چیز رو start می‌کنه:**
```powershell
powershell -ExecutionPolicy Bypass -File "E:\site-jadide-man\START.ps1"
```

یا به صورت دستی:

**مرحله ۱ — PostgreSQL:**
```powershell
powershell -ExecutionPolicy Bypass -File "E:\site-jadide-man\local-services\start-pg.ps1"
```

**مرحله ۲ — Redis (background):**
```powershell
Start-Process -FilePath "E:\site-jadide-man\local-services\redis\redis-server.exe" -ArgumentList "--port 6379" -WindowStyle Hidden
```

**مرحله ۳ — API (پنجره جدید):**
```powershell
powershell -ExecutionPolicy Bypass -File "E:\site-jadide-man\start-api.ps1"
```

**مرحله ۴ — Web (پنجره جدید):**
```powershell
powershell -ExecutionPolicy Bypass -File "E:\site-jadide-man\start-web.ps1"
```

**مرحله ۵ — Admin (پنجره جدید):**
```powershell
powershell -ExecutionPolicy Bypass -File "E:\site-jadide-man\start-admin.ps1"
```

---

## اطلاعات اتصال

| سرویس | آدرس |
|--------|------|
| Web | http://localhost:3000 |
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/api/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## اطلاعات ادمین

| فیلد | مقدار |
|------|-------|
| Email | admin@platform.com |
| Password | Admin@123456 |

## اطلاعات دیتابیس

| فیلد | مقدار |
|------|-------|
| Host | localhost:5432 |
| Database | career_platform |
| User | career_user |
| Password | career_pass123 |

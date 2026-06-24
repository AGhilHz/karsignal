# راهنمای Deployment روی Ubuntu 24.04

## 📋 پیش‌نیازها

1. **سرور Ubuntu 24.04** با حداقل 2GB RAM
2. **دامنه** که DNS آن به IP سرور اشاره کند
3. **دسترسی root** به سرور

## 🚀 روش نصب (ساده)

### مرحله 1: اتصال به سرور

```bash
ssh root@your-server-ip
```

### مرحله 2: دانلود اسکریپت نصب

```bash
# آپلود فایل deploy-ubuntu24.sh به سرور
# از کامپیوتر خودتان اجرا کنید:
scp deploy-ubuntu24.sh root@your-server-ip:/root/

# یا مستقیم از GitHub:
wget https://raw.githubusercontent.com/your-repo/career-platform/main/deploy-ubuntu24.sh
```

### مرحله 3: اجرای اسکریپت

```bash
chmod +x deploy-ubuntu24.sh
sudo bash deploy-ubuntu24.sh
```

اسکریپت از شما می‌پرسد:
- **Domain**: دامنه شما (مثلاً `example.com`)
- **Email**: ایمیل برای SSL certificate
- **Passwords**: می‌توانید Enter بزنید تا خودکار تولید شوند

### مرحله 4: تنظیم DNS

به پنل دامنه خود بروید و این رکوردها را اضافه کنید:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | IP سرور شما | 300 |
| A | www | IP سرور شما | 300 |
| A | admin | IP سرور شما | 300 |

### مرحله 5: ویرایش تنظیمات

```bash
nano /opt/career-platform/.env
```

**مهم:** این مقادیر را حتماً تنظیم کنید:

```env
# OpenAI API Key (الزامی برای AI Insights)
OPENAI_API_KEY=sk-your-key-here

# ایمیل (برای ارسال نوتیفیکیشن)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🔧 دستورات مفید

### مشاهده لاگ‌ها
```bash
cd /opt/career-platform

# لاگ تمام سرویس‌ها
docker compose logs -f

# فقط لاگ API
docker compose logs -f api

# فقط لاگ دیتابیس
docker compose logs -f postgres
```

### مدیریت سرویس‌ها
```bash
# ری‌استارت همه
docker compose restart

# ری‌استارت فقط API
docker compose restart api

# متوقف کردن همه
docker compose down

# شروع مجدد
docker compose up -d
```

### بکاپ‌گیری
```bash
# بکاپ دستی
/opt/backups/backup.sh

# بکاپ خودکار هر روز ساعت 2 صبح انجام می‌شود
```

### آپدیت پروژه
```bash
cd /opt/career-platform

# دریافت تغییرات جدید
git pull

# بیلد مجدد
docker compose build --no-cache

# ری‌استارت
docker compose down && docker compose up -d

# اجرای migration‌های جدید
docker compose exec api npx prisma migrate deploy
```

### مشاهده وضعیت سرویس‌ها
```bash
docker compose ps
```

---

## 🔐 امنیت

### فایروال
- Port 22 (SSH) ✅
- Port 80 (HTTP) ✅ 
- Port 443 (HTTPS) ✅
- سایر پورت‌ها ❌ مسدود

### Fail2ban
- محافظت در برابر حملات Brute Force
- بلاک کردن IP‌های مشکوک

### SSL Certificate
- Let's Encrypt نصب شده
- تمدید خودکار هر 12 ساعت چک می‌شود

---

## 🗄️ ساختار دیتابیس

### اجرای Migration
```bash
docker compose exec api npx prisma migrate deploy
```

### اجرای Seed (داده‌های اولیه)
```bash
docker compose exec api npm run db:seed
```

### دسترسی مستقیم به دیتابیس
```bash
docker compose exec postgres psql -U postgres career_platform
```

---

## ❓ مشکلات رایج

### مشکل: سایت بالا نمی‌آید

```bash
# بررسی وضعیت سرویس‌ها
docker compose ps

# بررسی لاگ‌ها
docker compose logs api

# ری‌استارت کامل
docker compose down && docker compose up -d
```

### مشکل: SSL کار نمی‌کند

```bash
# بررسی وضعیت certbot
certbot certificates

# دریافت مجدد certificate
certbot --nginx -d your-domain.com
```

### مشکل: دیتابیس connect نمی‌شود

```bash
# بررسی وضعیت postgres
docker compose logs postgres

# ری‌استارت دیتابیس
docker compose restart postgres
```

### مشکل: فضای دیسک کم شده

```bash
# پاک کردن Docker cache
docker system prune -a

# بررسی فضای استفاده شده
df -h
du -sh /opt/career-platform
```

---

## 📊 مانیتورینگ

### بررسی منابع سرور
```bash
htop
df -h
free -m
```

### بررسی وضعیت Docker
```bash
docker stats
```

### بررسی لاگ‌های سیستم
```bash
journalctl -u docker -f
```

---

## 🆘 پشتیبانی

اگر مشکلی داشتید:
1. لاگ‌ها را بررسی کنید
2. وضعیت DNS را چک کنید
3. فایروال سرور را بررسی کنید

---

**آخرین بروزرسانی:** $(date)

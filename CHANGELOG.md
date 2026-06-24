# Changelog

All notable changes to Karsignal.ir will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-20
### Added
- **پلتفرم کامل شفافیت شغلی** با قابلیتهای:
  - آگهیهای استخدام (مانند Jobinja)
  - نظرات ناشناس کارمندان (مانند WikiTajrobe)
  - اطلاعات حقوق و دستمزد (مانند Glassdoor)
  - پروفایل حرفهای (مانند LinkedIn)
  - انجمن ناشناس (مانند Blind)
  - هوش مصنوعی برای Career Insights
- **سیستم حریم خصوصی پیشرفته**:
  - توکن‌سازی رمزنگاری برای نظرات ناشناس
  - هش یک‌طرفه - عدم امکان ردیابی
  - معماری Privacy by Design
- **پنل ادمین کامل**:
  - مدیریت نظرات
  - مدیریت کاربران
  - تأیید شرکتها
- **Deployment Script** برای Ubuntu 24.04
- **CI/CD Pipeline** با GitHub Actions

### Tech Stack
- Frontend: Next.js 15, React, TypeScript, Tailwind
- Backend: NestJS, TypeScript
- Database: PostgreSQL + Prisma
- Cache: Redis
- Search: Elasticsearch
- Storage: MinIO (S3 Compatible)
- AI: OpenAI GPT-4
- Deployment: Docker, Nginx

### Security Features
- JWT با refresh rotation
- Rate limiting روی همه endpoints
- CORS properly configured
- SQL injection prevention via Prisma
- XSS protection built-in
- HTTPS enforcement

---
**فارسی/English**

این اولین نسخه Karsignal.ir هست که یک پلتفرم کامل شفافیت شغلی برای بازار کار ایران ارائه میده.

This is the first release of Karsignal.ir, providing a complete career transparency platform for the Iranian job market.
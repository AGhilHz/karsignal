# وضعیت رفع مشکلات - Career Transparency Platform

---

## ✅ مشکلات رفع شده

### 1. OTP ایمیل با EmailService وصل شد
- **فایل:** `apps/api/src/modules/auth/otp.service.ts`
- `EmailService` inject شد و `sendEmailVerification(email, code)` صدا زده میشود

### 2. رابطههای ناقص در Prisma Schema رفع شد
- **فایل:** `packages/database/prisma/schema.prisma`
- `CompanyPlan` اکنون `@relation` کامل به `Company` دارد
- `User` model اکنون `applications Application[]` دارد
- `Review` model اکنون `votes ReviewVote[]` دارد
- مدل `ReviewVote` اضافه شد

### 3. Token دوبار ذخیره نمیشود
- **فایل:** `apps/web/src/lib/store.ts`
- `localStorage.setItem` های دستی حذف شدند — فقط cookie و zustand

### 4. Review Vote با deduplication
- **فایل:** `apps/api/src/modules/reviews/reviews.service.ts`
- قبل از increment، `ReviewVote` بررسی میشود
- از `$transaction` برای atomicity استفاده میشود

### 5. Community Vote Logic درست شد
- **فایل:** `apps/api/src/modules/community/community.service.ts`
- upvotes و downvotes جداگانه count میشوند

### 6. ProfilesService DTOهای typed دارد
- **فایل:** `apps/api/src/modules/profiles/dto/profile.dto.ts`
- `UpdateProfileDto`, `AddWorkExperienceDto`, `AddEducationDto`, `AddSkillDto` ساخته شدند

### 7. خطای صحیح در companies.service.ts
- **فایل:** `apps/api/src/modules/companies/companies.service.ts`
- `throw new Error` به `ForbiddenException` تغییر یافت
- `EventEmitter2` inject شد و `company.created` emit میشود

### 8. Elasticsearch Indexing کار میکند
- **فایل:** `apps/api/src/modules/search/search.service.ts`
- `@OnEvent('job.created')`, `@OnEvent('job.updated')`, `@OnEvent('company.created')`, `@OnEvent('company.updated')` اضافه شدند

### 9. packages/shared/src/types/ کامل شد
- **فایل:** `packages/shared/src/types/index.ts`
- `ApiResponse<T>`, `PaginatedResponse<T>`, `UserDto`, `CompanyDto`, `JobDto`, `ReviewDto`, `SalaryReportDto` تعریف شدند

### 10. Salary Reports به moderation queue رفتند
- **فایل:** `apps/api/src/modules/salaries/salaries.service.ts`
- status از `APPROVED` به `PENDING` تغییر یافت
- به `moderation` queue اضافه شد

### 11. Rate Limiting روی Review Vote اضافه شد
- **فایل:** `apps/api/src/modules/reviews/reviews.controller.ts`
- `@Throttle({ default: { limit: 10, ttl: 60000 } })` روی vote endpoint

### 12. Admin Panel صفحات کامل دارد
- reviews/page.tsx — moderation با AI scores
- users/page.tsx — مدیریت کاربران و ban
- companies/page.tsx — تأیید شرکتها

---

## قوانین کلی کدنویسی برای این پروژه

- هرگز `anonymousAuthorToken` را در پاسخهای public برنگردان
- هرگز `userId` را کنار محتوای anonymous ذخیره نکن
- همیشه از `ForbiddenException` / `NotFoundException` به جای `throw new Error` استفاده کن
- همه DTOها باید typed باشند — از `any` پرهیز کن
- قبل از هر عملیات destructive، تراکنش Prisma (`$transaction`) استفاده کن
- Token فقط در httpOnly cookie ذخیره شود، نه localStorage

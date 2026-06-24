# Contributing to Karsignal.ir

First off, thanks for taking the time to contribute! ❤️

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Development Setup
```bash
# Clone the repository
git clone https://github.com/AGhilHz/karsignal.git
cd karsignal

# Install dependencies
npm install

# Start services
docker-compose up -d

# Run migrations
cd apps/api && npx prisma migrate dev

# Start dev servers
npm run dev
```

## Code Style

### TypeScript
- Use TypeScript strict mode
- No `any` type - always be specific
- Use interfaces for object shapes
- Use types for unions and tuples

### Naming Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Functions/variables: camelCase (`getUserData`)
- Constants: UPPER_SNAKE_CASE (`API_URL`)
- Files: kebab-case (`user-service.ts`)

### Commit Messages
Use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add user profile page
fix: resolve login issue with OTP
docs: update deployment guide
refactor: simplify authentication logic
test: add unit tests for salary service
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### PR Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] No console logs in production code
- [ ] No hardcoded secrets

## Project Structure

```
karsignal/
├── apps/           # Applications
│   ├── web/       # Frontend (Next.js)
│   ├── api/       # Backend (NestJS)
│   └── admin/     # Admin panel
├── packages/       # Shared packages
│   ├── database/  # Prisma schema
│   ├── shared/    # Shared types/utils
│   └── ui/        # Shared components
└── infrastructure/ # Deployment configs
```

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- --testNamePattern="auth"

# Run with coverage
npm run test:coverage
```

## Documentation

- Update README.md for user-facing changes
- Update API docs in `/docs/api/`
- Add comments for complex logic
- Keep CHANGELOG.md updated

## Security

- Never commit secrets (`.env`, passwords)
- Use environment variables
- Validate all user inputs
- Sanitize HTML output
- Rate limit sensitive endpoints

## Questions?

Open an issue or start a discussion on GitHub!

---

**Persian/فارسی:**

## مشارکت در Karsignal.ir

ممنون که وقت میذاری برای مشارکت! ❤️

### راهنمای فارسی
- برای سوالات به فارسی هم میتونی issue باز کنی
- مستندات رو به فارسی هم میتونی بنویسی
- اگر مشکلی درک کردی، بپرس!

### نکات مهم
- از دیتابیس ایران استفاده میکنیم (PostgreSQL)
- حقوق کاربران ایرانی حفظ میشه
- سیستم anonymous طراحی شده
- از AI برای moderation استفاده میکنیم

با هم Karsignal.ir رو بهتر میکنیم! 🚀
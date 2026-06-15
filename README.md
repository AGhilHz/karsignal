# Career Transparency Platform (پلتفرم شفافیت شغلی)

A production-grade platform for the Iranian job market combining:
- Job Board (like Jobinja)
- Anonymous Workplace Reviews (like WikiTajrobe)
- Salary Intelligence (like Glassdoor)
- Professional Profiles (like LinkedIn)
- Anonymous Community Discussions (like Blind)
- AI Career Insights

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TypeScript, Tailwind, Shadcn UI |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Search | Elasticsearch |
| Queue | BullMQ |
| Storage | S3 Compatible (MinIO) |
| AI | OpenAI |
| Deployment | Docker, Docker Compose, Nginx, Cloudflare |

## Project Structure

```
career-transparency-platform/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   ├── api/          # NestJS backend
│   └── admin/        # Admin panel (Next.js)
├── packages/
│   ├── database/     # Prisma schema & migrations
│   ├── shared/       # Shared types, DTOs, utils
│   └── ui/           # Shared UI components
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── scripts/
└── docs/
```

## Quick Start

```bash
cp .env.example .env
docker-compose up -d
cd apps/api && npm run migrate
npm run dev
```

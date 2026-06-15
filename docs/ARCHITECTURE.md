# Architecture — Career Transparency Platform

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Cloudflare CDN                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      Nginx (Reverse Proxy)                   │
│              Rate Limiting · SSL Termination                 │
└──────┬───────────────────┬──────────────────────────────────┘
       │                   │
┌──────▼──────┐    ┌───────▼──────┐    ┌──────────────────────┐
│  Next.js 15 │    │  NestJS API  │    │  Next.js Admin Panel │
│  (Web App)  │    │  (REST API)  │    │  (Internal Only)     │
│  Port 3000  │    │  Port 3001   │    │  Port 3002           │
└─────────────┘    └──────┬───────┘    └──────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
   │ PostgreSQL  │ │    Redis    │ │Elasticsearch│
   │  (Primary)  │ │  (Cache +   │ │  (Search)  │
   │             │ │   Queue)    │ │            │
   └─────────────┘ └─────────────┘ └────────────┘
          │
   ┌──────▼──────┐
   │    MinIO    │
   │  (S3 Files) │
   └─────────────┘
```

## Privacy Architecture (Critical)

```
User submits review
        │
        ▼
AnonymityService.getAnonymousToken(userId)
        │
        ▼
HMAC-SHA256(userId, ANONYMIZATION_SALT)
        │
        ▼
anonymousToken (64-char hex, one-way, deterministic)
        │
        ▼
Review stored with anonymousToken (NOT userId)
        │
        ▼
Even with full DB access: review ←→ user mapping IMPOSSIBLE
```

**Key properties:**
- Same user always gets same token (for rate limiting)
- Different users always get different tokens
- Token cannot be reversed to find userId
- Admins see content, never identity
- `ANONYMIZATION_SALT` must NEVER change after launch

## Module Structure

```
apps/api/src/
├── modules/
│   ├── auth/           # JWT, OTP, Trust Score, Anonymity
│   ├── users/          # User management
│   ├── profiles/       # Resume builder, PDF export
│   ├── companies/      # Company pages, AI reports
│   ├── jobs/           # Job board, ATS pipeline
│   ├── reviews/        # Anonymous reviews + AI moderation
│   ├── salaries/       # Salary intelligence
│   ├── interviews/     # Interview experiences
│   ├── community/      # Anonymous discussions
│   ├── layoffs/        # Layoff tracker (aggregate only)
│   ├── ai/             # OpenAI integration
│   ├── search/         # Elasticsearch + AI search
│   ├── storage/        # S3/MinIO file uploads
│   ├── notifications/  # User notifications
│   └── admin/          # Moderation panel
└── common/
    ├── guards/         # JWT, Roles, TrustLevel
    ├── decorators/     # @Public, @Roles, @RequireTrustLevel
    ├── filters/        # Global exception filter
    ├── interceptors/   # Transform, Logging
    └── health/         # Health check endpoint
```

## Trust Score System

| Factor | Points |
|--------|--------|
| Email verified | +10 |
| Phone verified | +20 |
| Identity verified | +15 |
| Employment verified | +15 |
| Resume completeness (max) | +20 |
| Helpful votes (max) | +15 |
| Reports against user (penalty) | -5 each |

**Trust Levels:**
- Level 0: Unverified (can browse)
- Level 1: Phone verified (can submit reviews/salaries)
- Level 2: Identity verified (full access)
- Level 3: Employment verified (verified badge)
- Level 4: Interview verified (highest trust)

## Queue Architecture (BullMQ)

```
moderation queue:
  ├── moderate-review      → AI spam/toxicity check
  ├── moderate-discussion  → AI content check
  └── moderate-comment     → AI content check

ai-reports queue:
  └── generate-company-report → Nightly AI analysis

notifications queue:
  └── send-notification → Email/SMS delivery
```

## Database Design Principles

1. **Anonymity**: `anonymousAuthorToken` stored instead of `userId` on all user-generated content
2. **Aggregation**: Salary/review stats computed by background jobs, stored as aggregates
3. **Soft deletes**: Content uses `ContentStatus` enum, never hard-deleted
4. **Audit trail**: `ModerationLog` tracks all moderation actions
5. **Indexes**: All foreign keys and frequently-queried fields indexed

## API Versioning

All endpoints are versioned: `/api/v1/...`

Future versions can be added without breaking existing clients.

## Security Layers

1. **Cloudflare**: DDoS protection, WAF, Turnstile bot detection
2. **Nginx**: Rate limiting (30 req/min general, 5 req/min auth)
3. **NestJS Throttler**: Per-endpoint rate limiting
4. **JWT**: Short-lived access tokens (15min) + refresh tokens (7d)
5. **bcrypt**: Password hashing (cost 12)
6. **Helmet**: Security headers
7. **CORS**: Whitelist-only origins
8. **Input validation**: class-validator on all DTOs
9. **SQL injection**: Prisma parameterized queries (no raw SQL)
10. **XSS**: Content sanitization via AI moderation

# Career Transparency Platform (پلتفرم شفافیت شغلی)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Docker](https://img.shields.io/badge/Docker-✅-blue)

A production-grade platform for the Iranian job market combining:
- **Job Board** (like Jobinja)
- **Anonymous Workplace Reviews** (like WikiTajrobe)
- **Salary Intelligence** (like Glassdoor)
- **Professional Profiles** (like LinkedIn)
- **Anonymous Community Discussions** (like Blind)
- **AI Career Insights**

## 🌟 Features

### 🔐 Privacy First
- **Anonymous reviews** with cryptographic tokenization
- **One-way hashing** - cannot trace reviews to users
- **Privacy by design** architecture

### 🤖 AI Powered
- Review moderation with toxicity detection
- Resume scoring & job matching
- Salary insights & market analysis

### 🏢 For Companies
- Job posting & applicant tracking
- Company profile with reviews
- Recruitment analytics

### 👤 For Professionals
- Anonymous salary sharing
- Interview experiences
- Career growth insights

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, TypeScript, Tailwind, Shadcn UI |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Search | Elasticsearch |
| Queue | BullMQ |
| Storage | S3 Compatible (MinIO) |
| AI | OpenAI GPT-4 |
| Deployment | Docker, Docker Compose, Nginx |

## 📁 Project Structure

```
career-transparency-platform/
├── apps/
│   ├── web/          # Next.js 15 frontend (Port 3000)
│   ├── api/          # NestJS backend (Port 3001)
│   └── admin/        # Admin panel (Next.js)
├── packages/
│   ├── database/     # Prisma schema & migrations
│   ├── shared/       # Shared types, DTOs, utils
│   └── ui/           # Shared UI components
├── infrastructure/
│   ├── docker/       # Docker configurations
│   ├── nginx/        # Reverse proxy configs
│   └── scripts/      # Deployment scripts
└── docs/             # Documentation
```

## 🚀 Quick Start (Development)

```bash
# 1. Clone repository
git clone https://github.com/AGhilHz/karsignal.git
cd karsignal

# 2. Setup environment
cp .env.example .env
# Edit .env with your settings

# 3. Start services with Docker
docker-compose up -d

# 4. Run database migrations
cd apps/api && npm run migrate

# 5. Start development servers
npm run dev           # Runs all apps concurrently
# or individually:
npm run dev:web       # Frontend (localhost:3000)
npm run dev:api       # Backend API (localhost:3001)
npm run dev:admin     # Admin panel
```

## 📦 Production Deployment

### Ubuntu 24.04 LTS
```bash
wget https://raw.githubusercontent.com/AGhilHz/karsignal/main/deploy-ubuntu24.sh
chmod +x deploy-ubuntu24.sh
sudo bash deploy-ubuntu24.sh
```

## 🔧 Available Scripts

```bash
# Development
npm run dev           # Run all apps
npm run build         # Build all apps
npm run test          # Run tests
npm run lint          # Lint code

# Database
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio

# Docker
docker-compose up -d  # Start all services
docker-compose logs   # View logs
docker-compose down   # Stop all services
```

## 📊 Database Schema

See detailed schema in [`packages/database/prisma/schema.prisma`](packages/database/prisma/schema.prisma)

## 🔐 Security & Privacy

- **JWT tokens** with refresh rotation
- **Rate limiting** on all endpoints
- **CORS** properly configured
- **SQL injection prevention** via Prisma
- **XSS protection** built-in
- **File upload validation**
- **HTTPS enforcement**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions or support, please open an issue on GitHub.

🌐 **Live Website:** https://karsignal.ir
📱 **GitHub Repository:** https://github.com/AGhilHz/karsignal


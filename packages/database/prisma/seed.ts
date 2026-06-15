import {
  PrismaClient, UserRole, TrustLevel, CompanySize,
  EmploymentType, ContentStatus, InterviewDifficulty, InterviewResult,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function anonToken(seed: string) {
  return crypto.createHmac('sha256', 'seed-salt-2024').update(seed).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin ───────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@platform.com' },
    update: {},
    create: {
      email: 'admin@platform.com',
      passwordHash: adminHash,
      role: UserRole.SUPER_ADMIN,
      trustLevel: TrustLevel.LEVEL_4_INTERVIEW_VERIFIED,
      trustScore: 100,
      emailVerifiedAt: new Date(),
      anonymousTokenHash: anonToken('admin@platform.com'),
      profile: { create: { firstName: 'مدیر', lastName: 'سیستم', isPublic: false } },
    },
  });
  console.log('✅ Admin:', admin.email);

  // ─── Demo user ───────────────────────────────────────────
  const userHash = await bcrypt.hash('User@123456', 12);
  await prisma.user.upsert({
    where: { email: 'demo@platform.com' },
    update: {},
    create: {
      email: 'demo@platform.com',
      passwordHash: userHash,
      role: UserRole.VERIFIED_USER,
      trustLevel: TrustLevel.LEVEL_2_IDENTITY_VERIFIED,
      trustScore: 60,
      emailVerifiedAt: new Date(),
      anonymousTokenHash: anonToken('demo@platform.com'),
      profile: { create: { firstName: 'کاربر', lastName: 'نمونه', headline: 'توسعه‌دهنده نرم‌افزار', city: 'تهران' } },
    },
  });
  console.log('✅ Demo user created');

  // ─── Topics ──────────────────────────────────────────────
  const topicsData = [
    { name: 'شرکت‌ها', slug: 'companies', description: 'بحث درباره شرکت‌های مختلف' },
    { name: 'حقوق و دستمزد', slug: 'salaries', description: 'اطلاعات حقوق و مزایا' },
    { name: 'مصاحبه', slug: 'interviews', description: 'تجربیات مصاحبه شغلی' },
    { name: 'اخراج و تعدیل', slug: 'layoffs', description: 'اخبار اخراج و تعدیل نیرو' },
    { name: 'مسیر شغلی', slug: 'careers', description: 'راهنمایی مسیر شغلی' },
    { name: 'فناوری', slug: 'tech', description: 'بحث‌های فنی و تکنولوژی' },
    { name: 'ریموت و فریلنسر', slug: 'remote', description: 'کار از راه دور و فریلنسری' },
  ];
  for (const t of topicsData) {
    await prisma.topic.upsert({ where: { slug: t.slug }, update: {}, create: t });
  }
  console.log('✅ Topics created');

  // ─── Skills ──────────────────────────────────────────────
  const skillsData = [
    { name: 'JavaScript', slug: 'javascript', category: 'برنامه‌نویسی' },
    { name: 'TypeScript', slug: 'typescript', category: 'برنامه‌نویسی' },
    { name: 'React', slug: 'react', category: 'فرانت‌اند' },
    { name: 'Next.js', slug: 'nextjs', category: 'فرانت‌اند' },
    { name: 'Vue.js', slug: 'vuejs', category: 'فرانت‌اند' },
    { name: 'Node.js', slug: 'nodejs', category: 'بک‌اند' },
    { name: 'NestJS', slug: 'nestjs', category: 'بک‌اند' },
    { name: 'Python', slug: 'python', category: 'برنامه‌نویسی' },
    { name: 'Django', slug: 'django', category: 'بک‌اند' },
    { name: 'Go', slug: 'go', category: 'برنامه‌نویسی' },
    { name: 'Java', slug: 'java', category: 'برنامه‌نویسی' },
    { name: 'PostgreSQL', slug: 'postgresql', category: 'پایگاه داده' },
    { name: 'MongoDB', slug: 'mongodb', category: 'پایگاه داده' },
    { name: 'Redis', slug: 'redis', category: 'پایگاه داده' },
    { name: 'Docker', slug: 'docker', category: 'DevOps' },
    { name: 'Kubernetes', slug: 'kubernetes', category: 'DevOps' },
    { name: 'AWS', slug: 'aws', category: 'ابری' },
    { name: 'Git', slug: 'git', category: 'ابزار' },
    { name: 'مدیریت محصول', slug: 'product-management', category: 'مدیریت' },
    { name: 'UI/UX', slug: 'ui-ux', category: 'طراحی' },
    { name: 'Figma', slug: 'figma', category: 'طراحی' },
    { name: 'داده‌کاوی', slug: 'data-science', category: 'داده' },
    { name: 'Machine Learning', slug: 'machine-learning', category: 'داده' },
  ];
  for (const s of skillsData) {
    await prisma.skill.upsert({ where: { slug: s.slug }, update: {}, create: s });
  }
  console.log('✅ Skills created');

  // ─── Companies ───────────────────────────────────────────
  const companiesData = [
    {
      name: 'دیجی‌کالا', slug: 'digikala', industry: 'تجارت الکترونیک', city: 'تهران',
      website: 'https://digikala.com', size: CompanySize.ENTERPRISE_1000_PLUS, foundedYear: 2006,
      description: 'بزرگترین فروشگاه اینترنتی ایران با بیش از ۴۵ میلیون کاربر فعال', isVerified: true,
      overallRating: 3.8, reviewCount: 0, salaryCount: 0,
    },
    {
      name: 'اسنپ', slug: 'snapp', industry: 'حمل‌ونقل', city: 'تهران',
      website: 'https://snapp.ir', size: CompanySize.LARGE_201_1000, foundedYear: 2014,
      description: 'پلتفرم حمل‌ونقل هوشمند ایران', isVerified: true,
      overallRating: 3.5, reviewCount: 0, salaryCount: 0,
    },
    {
      name: 'کافه‌بازار', slug: 'cafebazaar', industry: 'فناوری', city: 'تهران',
      website: 'https://cafebazaar.ir', size: CompanySize.MEDIUM_51_200, foundedYear: 2011,
      description: 'مارکت اپلیکیشن‌های اندروید فارسی', isVerified: true,
      overallRating: 4.1, reviewCount: 0, salaryCount: 0,
    },
    {
      name: 'تپسی', slug: 'tapsi', industry: 'حمل‌ونقل', city: 'تهران',
      website: 'https://tapsi.ir', size: CompanySize.LARGE_201_1000, foundedYear: 2016,
      description: 'سرویس تاکسی اینترنتی', isVerified: true,
      overallRating: 3.3, reviewCount: 0, salaryCount: 0,
    },
    {
      name: 'فیلیمو', slug: 'filimo', industry: 'رسانه', city: 'تهران',
      website: 'https://filimo.com', size: CompanySize.MEDIUM_51_200, foundedYear: 2015,
      description: 'پلتفرم ویدیو آن‌دیماند ایرانی', isVerified: false,
      overallRating: 3.9, reviewCount: 0, salaryCount: 0,
    },
    {
      name: 'زوپ', slug: 'zoop', industry: 'فناوری مالی', city: 'تهران',
      website: 'https://zoop.ir', size: CompanySize.SMALL_11_50, foundedYear: 2020,
      description: 'استارتاپ فین‌تک نوپا', isVerified: false,
      overallRating: 3.2, reviewCount: 0, salaryCount: 0,
    },
    {
      name: 'شیپور', slug: 'sheypoor', industry: 'تجارت الکترونیک', city: 'تهران',
      website: 'https://sheypoor.com', size: CompanySize.MEDIUM_51_200, foundedYear: 2013,
      description: 'سایت آگهی‌های رایگان ایران', isVerified: true,
      overallRating: 3.6, reviewCount: 0, salaryCount: 0,
    },
    {
      name: 'آپ', slug: 'app-ir', industry: 'فناوری مالی', city: 'تهران',
      website: 'https://app.ir', size: CompanySize.LARGE_201_1000, foundedYear: 2013,
      description: 'درگاه پرداخت و کیف پول دیجیتال', isVerified: true,
      overallRating: 3.7, reviewCount: 0, salaryCount: 0,
    },
  ];

  const createdCompanies: Record<string, string> = {};
  for (const c of companiesData) {
    const company = await prisma.company.upsert({
      where: { slug: c.slug }, update: {}, create: c,
    });
    createdCompanies[c.slug] = company.id;
  }
  console.log('✅ Companies created');

  // ─── Jobs ────────────────────────────────────────────────
  const jobsData = [
    {
      companySlug: 'digikala', title: 'Senior Backend Developer', slug: `senior-backend-digikala-${Date.now()}`,
      description: 'به دنبال توسعه‌دهنده بک‌اند ارشد با تجربه در Go و microservices هستیم.',
      city: 'تهران', isRemote: false, employmentType: EmploymentType.FULL_TIME,
      experienceMin: 4, experienceMax: 8, salaryMin: 50000000, salaryMax: 80000000,
      isSalaryVisible: true, industry: 'تجارت الکترونیک', status: 'ACTIVE', isFeatured: true,
    },
    {
      companySlug: 'digikala', title: 'Frontend Developer (React)', slug: `frontend-react-digikala-${Date.now() + 1}`,
      description: 'توسعه‌دهنده فرانت‌اند با تسلط بر React و TypeScript.',
      city: 'تهران', isRemote: true, employmentType: EmploymentType.FULL_TIME,
      experienceMin: 2, experienceMax: 5, salaryMin: 35000000, salaryMax: 55000000,
      isSalaryVisible: true, industry: 'تجارت الکترونیک', status: 'ACTIVE',
    },
    {
      companySlug: 'snapp', title: 'DevOps Engineer', slug: `devops-snapp-${Date.now() + 2}`,
      description: 'مهندس DevOps با تجربه در Kubernetes و CI/CD.',
      city: 'تهران', isRemote: false, employmentType: EmploymentType.FULL_TIME,
      experienceMin: 3, experienceMax: 7, salaryMin: 45000000, salaryMax: 75000000,
      isSalaryVisible: true, industry: 'حمل‌ونقل', status: 'ACTIVE', isHighlighted: true,
    },
    {
      companySlug: 'snapp', title: 'Product Manager', slug: `pm-snapp-${Date.now() + 3}`,
      description: 'مدیر محصول با تجربه در محصولات B2C موبایل.',
      city: 'تهران', isRemote: false, employmentType: EmploymentType.FULL_TIME,
      experienceMin: 3, experienceMax: 6, salaryMin: 55000000, salaryMax: 90000000,
      isSalaryVisible: false, industry: 'حمل‌ونقل', status: 'ACTIVE',
    },
    {
      companySlug: 'cafebazaar', title: 'Android Developer', slug: `android-cafebazaar-${Date.now() + 4}`,
      description: 'توسعه‌دهنده اندروید با تجربه در Kotlin.',
      city: 'تهران', isRemote: true, employmentType: EmploymentType.FULL_TIME,
      experienceMin: 2, experienceMax: 5, salaryMin: 40000000, salaryMax: 65000000,
      isSalaryVisible: true, industry: 'فناوری', status: 'ACTIVE',
    },
    {
      companySlug: 'cafebazaar', title: 'Data Scientist', slug: `data-scientist-cafebazaar-${Date.now() + 5}`,
      description: 'دانشمند داده با تسلط بر Python و ML.',
      city: 'تهران', isRemote: false, employmentType: EmploymentType.FULL_TIME,
      experienceMin: 2, experienceMax: 5, salaryMin: 45000000, salaryMax: 70000000,
      isSalaryVisible: true, industry: 'فناوری', status: 'ACTIVE',
    },
    {
      companySlug: 'tapsi', title: 'Full Stack Developer', slug: `fullstack-tapsi-${Date.now() + 6}`,
      description: 'توسعه‌دهنده Full Stack با Node.js و React.',
      city: 'تهران', isRemote: true, employmentType: EmploymentType.FULL_TIME,
      experienceMin: 2, experienceMax: 6, salaryMin: 38000000, salaryMax: 60000000,
      isSalaryVisible: true, industry: 'حمل‌ونقل', status: 'ACTIVE',
    },
    {
      companySlug: 'sheypoor', title: 'UI/UX Designer', slug: `uiux-sheypoor-${Date.now() + 7}`,
      description: 'طراح UI/UX با تجربه در Figma و تحقیقات کاربری.',
      city: 'تهران', isRemote: false, employmentType: EmploymentType.FULL_TIME,
      experienceMin: 2, experienceMax: 5, salaryMin: 30000000, salaryMax: 50000000,
      isSalaryVisible: true, industry: 'تجارت الکترونیک', status: 'ACTIVE',
    },
    {
      companySlug: 'zoop', title: 'Backend Developer (Python)', slug: `backend-python-zoop-${Date.now() + 8}`,
      description: 'توسعه‌دهنده بک‌اند با Django و FastAPI.',
      city: 'تهران', isRemote: true, employmentType: EmploymentType.FULL_TIME,
      experienceMin: 1, experienceMax: 4, salaryMin: 25000000, salaryMax: 45000000,
      isSalaryVisible: true, industry: 'فناوری مالی', status: 'ACTIVE',
    },
    {
      companySlug: 'filimo', title: 'Video Streaming Engineer', slug: `streaming-filimo-${Date.now() + 9}`,
      description: 'مهندس متخصص در streaming و CDN.',
      city: 'تهران', isRemote: false, employmentType: EmploymentType.FULL_TIME,
      experienceMin: 3, experienceMax: 7, salaryMin: 48000000, salaryMax: 72000000,
      isSalaryVisible: false, industry: 'رسانه', status: 'ACTIVE',
    },
  ];

  for (const j of jobsData) {
    const { companySlug, ...jobData } = j;
    await prisma.job.create({
      data: { ...jobData, companyId: createdCompanies[companySlug] },
    });
  }
  console.log('✅ Jobs created');

  // ─── Reviews ─────────────────────────────────────────────
  const reviewsData = [
    {
      companySlug: 'digikala', position: 'Senior Backend Developer', department: 'فنی',
      city: 'تهران', employmentType: EmploymentType.FULL_TIME, startYear: 2021, endYear: 2023,
      isCurrent: false, salaryRange: '50M-70M',
      ratingOverall: 4, ratingSalary: 3.5, ratingManagement: 3.5,
      ratingGrowth: 4, ratingCulture: 4, ratingBenefits: 4.5, ratingWorkLife: 3.5,
      pros: 'تیم فنی قوی، پروژه‌های بزرگ و چالش‌برانگیز، بیمه تکمیلی خوب',
      cons: 'فشار کاری بالا، گاهی اضافه‌کاری بدون دریافت مزد اضافی',
      advice: 'از اول مرزها رو مشخص کن',
      token: 'reviewer-digikala-1',
    },
    {
      companySlug: 'digikala', position: 'Frontend Developer', department: 'فنی',
      city: 'تهران', employmentType: EmploymentType.FULL_TIME, startYear: 2022,
      isCurrent: true, salaryRange: '35M-45M',
      ratingOverall: 4.5, ratingSalary: 4, ratingManagement: 4,
      ratingGrowth: 4.5, ratingCulture: 4.5, ratingBenefits: 5, ratingWorkLife: 4,
      pros: 'محیط کاری پویا، یادگیری مداوم، همکاران با انگیزه',
      cons: 'روند ارتقای شغلی کمی طولانی است',
      advice: 'در جلسات بیشتر شرکت کن و ایده بده',
      token: 'reviewer-digikala-2',
    },
    {
      companySlug: 'snapp', position: 'Backend Developer', department: 'فنی',
      city: 'تهران', employmentType: EmploymentType.FULL_TIME, startYear: 2020, endYear: 2022,
      isCurrent: false, salaryRange: '40M-60M',
      ratingOverall: 3.5, ratingSalary: 3, ratingManagement: 3,
      ratingGrowth: 3.5, ratingCulture: 3.5, ratingBenefits: 4, ratingWorkLife: 3,
      pros: 'سیستم‌های technical جالب، مسائل scale بزرگ',
      cons: 'مدیریت میانی ضعیف، چرخش نیرو زیاد',
      advice: 'با تیم مستقیمت قبل از join مصاحبه کن',
      token: 'reviewer-snapp-1',
    },
    {
      companySlug: 'snapp', position: 'Product Manager', department: 'محصول',
      city: 'تهران', employmentType: EmploymentType.FULL_TIME, startYear: 2021,
      isCurrent: true, salaryRange: '60M-80M',
      ratingOverall: 4, ratingSalary: 4, ratingManagement: 3.5,
      ratingGrowth: 4, ratingCulture: 4, ratingBenefits: 4.5, ratingWorkLife: 3.5,
      pros: 'اتونومی خوب در تصمیم‌گیری، تیم محصول حرفه‌ای',
      cons: 'فرایندهای بوروکراتیک گاهی کند هستند',
      advice: 'data-driven باش و با تیم فنی رابطه خوب بساز',
      token: 'reviewer-snapp-2',
    },
    {
      companySlug: 'cafebazaar', position: 'Android Developer', department: 'فنی',
      city: 'تهران', employmentType: EmploymentType.FULL_TIME, startYear: 2019, endYear: 2022,
      isCurrent: false, salaryRange: '35M-55M',
      ratingOverall: 4.5, ratingSalary: 4, ratingManagement: 4.5,
      ratingGrowth: 4.5, ratingCulture: 5, ratingBenefits: 4.5, ratingWorkLife: 4.5,
      pros: 'فرهنگ کاری عالی، آزادی عمل بالا، مدیران دلسوز',
      cons: 'حقوق نسبت به بازار کمی پایین‌تر',
      advice: 'اگه culture مهمه حتما بیا',
      token: 'reviewer-cafebazaar-1',
    },
    {
      companySlug: 'tapsi', position: 'Full Stack Developer', department: 'فنی',
      city: 'تهران', employmentType: EmploymentType.FULL_TIME, startYear: 2021, endYear: 2023,
      isCurrent: false, salaryRange: '30M-50M',
      ratingOverall: 3, ratingSalary: 2.5, ratingManagement: 2.5,
      ratingGrowth: 3, ratingCulture: 3, ratingBenefits: 3.5, ratingWorkLife: 2.5,
      pros: 'تیم جوان و پرانرژی',
      cons: 'حقوق زیر بازار، unstability سازمانی زیاد',
      advice: 'برای تجربه اوله خوبه ولی بلندمدت موندن توصیه نمیکنم',
      token: 'reviewer-tapsi-1',
    },
  ];

  for (const r of reviewsData) {
    const { companySlug, token, ...reviewData } = r;
    await prisma.review.create({
      data: {
        ...reviewData,
        companyId: createdCompanies[companySlug],
        anonymousAuthorToken: anonToken(token),
        status: ContentStatus.APPROVED,
        qualityScore: 0.85,
      },
    });
  }
  console.log('✅ Reviews created');

  // Update company review counts
  for (const [slug, id] of Object.entries(createdCompanies)) {
    const agg = await prisma.review.aggregate({
      where: { companyId: id, status: ContentStatus.APPROVED },
      _avg: { ratingOverall: true, ratingSalary: true, ratingManagement: true, ratingGrowth: true, ratingCulture: true, ratingWorkLife: true },
      _count: { id: true },
    });
    if (agg._count.id > 0) {
      await prisma.company.update({
        where: { id },
        data: {
          reviewCount: agg._count.id,
          overallRating: agg._avg.ratingOverall,
          salaryScore: agg._avg.ratingSalary,
          managementScore: agg._avg.ratingManagement,
          growthScore: agg._avg.ratingGrowth,
          cultureScore: agg._avg.ratingCulture,
          workLifeScore: agg._avg.ratingWorkLife,
        },
      });
    }
  }
  console.log('✅ Company ratings updated');

  // ─── Salary Reports ──────────────────────────────────────
  const salariesData = [
    { companySlug: 'digikala', position: 'Senior Backend Developer', city: 'تهران', experienceYears: 5, baseSalary: 65000000, bonus: 10000000, token: 'salary-1' },
    { companySlug: 'digikala', position: 'Frontend Developer', city: 'تهران', experienceYears: 3, baseSalary: 42000000, token: 'salary-2' },
    { companySlug: 'digikala', position: 'Product Manager', city: 'تهران', experienceYears: 4, baseSalary: 75000000, bonus: 15000000, token: 'salary-3' },
    { companySlug: 'snapp', position: 'Backend Developer', city: 'تهران', experienceYears: 4, baseSalary: 55000000, token: 'salary-4' },
    { companySlug: 'snapp', position: 'DevOps Engineer', city: 'تهران', experienceYears: 5, baseSalary: 68000000, bonus: 8000000, token: 'salary-5' },
    { companySlug: 'cafebazaar', position: 'Android Developer', city: 'تهران', experienceYears: 3, baseSalary: 48000000, token: 'salary-6' },
    { companySlug: 'cafebazaar', position: 'Data Scientist', city: 'تهران', experienceYears: 3, baseSalary: 52000000, token: 'salary-7' },
    { companySlug: 'tapsi', position: 'Full Stack Developer', city: 'تهران', experienceYears: 2, baseSalary: 38000000, token: 'salary-8' },
    { companySlug: null, position: 'Senior Backend Developer', city: 'تهران', experienceYears: 6, baseSalary: 72000000, bonus: 12000000, token: 'salary-9' },
    { companySlug: null, position: 'Frontend Developer', city: 'تهران', experienceYears: 2, baseSalary: 32000000, token: 'salary-10' },
    { companySlug: null, position: 'DevOps Engineer', city: 'تهران', experienceYears: 4, baseSalary: 62000000, token: 'salary-11' },
    { companySlug: null, position: 'UI/UX Designer', city: 'تهران', experienceYears: 3, baseSalary: 40000000, token: 'salary-12' },
    { companySlug: null, position: 'Product Manager', city: 'تهران', experienceYears: 5, baseSalary: 80000000, bonus: 20000000, token: 'salary-13' },
    { companySlug: null, position: 'Data Scientist', city: 'اصفهان', experienceYears: 2, baseSalary: 35000000, token: 'salary-14' },
    { companySlug: null, position: 'Backend Developer', city: 'مشهد', experienceYears: 3, baseSalary: 30000000, token: 'salary-15' },
  ];

  for (const s of salariesData) {
    const { companySlug, token, ...salaryData } = s;
    await prisma.salaryReport.create({
      data: {
        ...salaryData,
        companyId: companySlug ? createdCompanies[companySlug] : null,
        anonymousAuthorToken: anonToken(token),
        employmentType: EmploymentType.FULL_TIME,
        reportYear: 2024,
        currency: 'IRR',
        status: ContentStatus.APPROVED,
        totalComp: (salaryData.baseSalary + (salaryData.bonus || 0)),
      },
    });
  }
  console.log('✅ Salary reports created');

  // ─── Interview Experiences ───────────────────────────────
  await prisma.interviewExperience.create({
    data: {
      companyId: createdCompanies['digikala'],
      anonymousAuthorToken: anonToken('interview-1'),
      position: 'Senior Backend Developer',
      city: 'تهران',
      difficulty: InterviewDifficulty.HARD,
      result: InterviewResult.ACCEPTED,
      duration: '۳ هفته',
      stages: [
        { name: 'تماس HR', duration: '۳۰ دقیقه' },
        { name: 'تست فنی آنلاین', duration: '۲ ساعت' },
        { name: 'مصاحبه فنی', duration: '۲ ساعت' },
        { name: 'مصاحبه نهایی', duration: '۱ ساعت' },
      ],
      technicalQuestions: [
        'توضیح دهید چطور یک سیستم توزیع‌شده طراحی می‌کنید',
        'مسئله N+1 در ORM چیست و چطور حل می‌شود',
        'تفاوت Redis و Memcached',
      ],
      hrQuestions: ['چرا دیجی‌کالا؟', 'بزرگترین چالش فنی که حل کردید؟'],
      tips: 'روی system design تمرکز کنید. سوالات behavioral هم مهم هستند.',
      offerReceived: true,
      status: ContentStatus.APPROVED,
    },
  });

  await prisma.interviewExperience.create({
    data: {
      companyId: createdCompanies['snapp'],
      anonymousAuthorToken: anonToken('interview-2'),
      position: 'DevOps Engineer',
      city: 'تهران',
      difficulty: InterviewDifficulty.MEDIUM,
      result: InterviewResult.REJECTED,
      duration: '۲ هفته',
      stages: [
        { name: 'تماس HR', duration: '۲۰ دقیقه' },
        { name: 'تست فنی', duration: '۳ ساعت' },
        { name: 'مصاحبه فنی', duration: '۱.۵ ساعت' },
      ],
      technicalQuestions: [
        'چطور یک Kubernetes cluster را برای HA تنظیم می‌کنید',
        'تجربه با CI/CD pipelines',
      ],
      hrQuestions: ['با تیم چطور کار می‌کنید؟'],
      tips: 'بر Kubernetes و Terraform تسلط داشته باشید.',
      offerReceived: false,
      status: ContentStatus.APPROVED,
    },
  });
  console.log('✅ Interview experiences created');

  // ─── Community Discussions ───────────────────────────────
  const topicRecords = await prisma.topic.findMany();
  const topicMap: Record<string, string> = {};
  for (const t of topicRecords) topicMap[t.slug] = t.id;

  const discussions = [
    {
      topicSlug: 'salaries', title: 'حقوق Senior Backend در تهران چقدر است؟ (۱۴۰۳)',
      body: 'سلام. می‌خواستم بدونم الان نرخ بازار برای یه Senior Backend با ۵ سال تجربه در تهران چقدره؟ من الان ۵۵ میلیون می‌گیرم، منصفانه‌ست؟',
      upvotes: 45, token: 'discussion-1',
    },
    {
      topicSlug: 'interviews', title: 'تجربه مصاحبه دیجی‌کالا - تیم فنی',
      body: 'تازه از مصاحبه دیجی‌کالا برگشتم. فرایند ۴ مرحله‌ای بود. سوالات system design خیلی مهم بودن. اگه سوال دارید بپرسید.',
      upvotes: 32, token: 'discussion-2',
    },
    {
      topicSlug: 'remote', title: 'بهترین شرکت‌های ریموت برای توسعه‌دهنده‌های ایرانی',
      body: 'کسی تجربه کار remote برای شرکت خارجی داره؟ چه پلتفرم‌هایی بهتره؟ Toptal، Turing یا جای دیگه‌ای؟',
      upvotes: 78, token: 'discussion-3',
    },
    {
      topicSlug: 'careers', title: 'از backend به DevOps - آیا ارزشش را دارد؟',
      body: 'الان ۴ سال سابقه backend دارم. داره به DevOps فکر می‌کنم. کسی این مسیر رو رفته؟ چه چیزهایی یاد بگیرم؟',
      upvotes: 56, token: 'discussion-4',
    },
    {
      topicSlug: 'companies', title: 'مقایسه دیجی‌کالا vs اسنپ برای توسعه‌دهنده',
      body: 'بین offer دیجی‌کالا و اسنپ مونده‌ام. حقوق تقریباً برابره. کدوم رو انتخاب کنم؟ از نظر یادگیری و culture کدوم بهتره؟',
      upvotes: 91, token: 'discussion-5',
    },
  ];

  for (const d of discussions) {
    await prisma.discussion.create({
      data: {
        topicId: topicMap[d.topicSlug],
        anonymousAuthorToken: anonToken(d.token),
        title: d.title,
        body: d.body,
        isAnonymous: true,
        authorDisplayName: 'توسعه‌دهنده نرم‌افزار',
        upvotes: d.upvotes,
        status: ContentStatus.APPROVED,
      },
    });
  }
  console.log('✅ Discussions created');

  // Update topic post counts
  for (const [slug, id] of Object.entries(topicMap)) {
    const count = await prisma.discussion.count({ where: { topicId: id, status: ContentStatus.APPROVED } });
    await prisma.topic.update({ where: { id }, data: { postCount: count } });
  }

  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────');
  console.log('👤 Admin:    admin@platform.com / Admin@123456');
  console.log('👤 Demo:     demo@platform.com  / User@123456');
  console.log('─────────────────────────────');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

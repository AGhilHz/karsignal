export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserDto {
  id: string;
  email: string;
  role: string;
  trustLevel: string;
  trustScore: number;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  createdAt: string;
}

export interface CompanyDto {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  industry?: string;
  city?: string;
  size?: string;
  overallRating?: number;
  reviewCount: number;
  isVerified: boolean;
}

export interface JobDto {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  company?: Pick<CompanyDto, 'id' | 'name' | 'slug' | 'logoUrl' | 'isVerified'>;
  city?: string;
  isRemote: boolean;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  isSalaryVisible: boolean;
  status: string;
  createdAt: string;
}

export interface ReviewDto {
  id: string;
  position: string;
  department?: string;
  city?: string;
  ratingOverall: number;
  ratingSalary: number;
  ratingManagement: number;
  ratingGrowth: number;
  ratingCulture: number;
  ratingBenefits: number;
  ratingWorkLife: number;
  pros?: string;
  cons?: string;
  advice?: string;
  isHelpful: number;
  isNotHelpful: number;
  createdAt: string;
}

export interface SalaryReportDto {
  id: string;
  position: string;
  city?: string;
  industry?: string;
  baseSalary: number;
  bonus?: number;
  totalComp?: number;
  reportYear: number;
  createdAt: string;
}

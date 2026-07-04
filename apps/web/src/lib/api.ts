import axios from 'axios';
import { clearAccessTokenCookie, setAccessTokenCookie } from './auth-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken });

        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        setAccessTokenCookie(data.data.accessToken);

        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        clearAccessTokenCookie();
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  },
);

// API helpers
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  verifyEmail: (code: string) => api.post('/auth/verify-email', { code }),
  sendPhoneOtp: (phone: string) => api.post('/auth/send-phone-otp', { phone }),
  verifyPhone: (phone: string, code: string) => api.post('/auth/verify-phone', { phone, code }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

export const companiesApi = {
  search: (params: any) => api.get('/companies/search', { params }),
  getBySlug: (slug: string) => api.get(`/companies/${slug}`),
  getTop: (params?: any) => api.get('/companies/top', { params }),
  create: (data: any) => api.post('/companies', data),
};

export const jobsApi = {
  search: (params: any) => api.get('/jobs', { params }),
  getBySlug: (slug: string) => api.get(`/jobs/${slug}`),
  apply: (id: string, data: any) => api.post(`/jobs/${id}/apply`, data),
  create: (data: any) => api.post('/jobs', data),
};

export const reviewsApi = {
  getRecent: (params?: any) => api.get('/reviews/recent', { params }),
  getByCompany: (companyId: string, params?: any) =>
    api.get(`/reviews/company/${companyId}`, { params }),
  getSummary: (companyId: string) => api.get(`/reviews/company/${companyId}/summary`),
  create: (data: any) => api.post('/reviews', data),
  voteHelpful: (id: string) => api.post(`/reviews/${id}/helpful`),
};

export const salariesApi = {
  getStats: (params: any) => api.get('/salaries/stats', { params }),
  getTrends: (params: any) => api.get('/salaries/trends', { params }),
  submit: (data: any) => api.post('/salaries/report', data),
};

export const interviewsApi = {
  getByCompany: (companyId: string, params?: any) =>
    api.get(`/interviews/company/${companyId}`, { params }),
  getPrep: (companyId: string, position: string) =>
    api.get(`/interviews/company/${companyId}/prep`, { params: { position } }),
  submit: (data: any) => api.post('/interviews', data),
};

export const communityApi = {
  getTopics: () => api.get('/community/topics'),
  getDiscussions: (params: any) => api.get('/community/discussions', { params }),
  createDiscussion: (data: any) => api.post('/community/discussions', data),
  addComment: (id: string, data: any) => api.post(`/community/discussions/${id}/comments`, data),
  vote: (id: string, value: 1 | -1) => api.post(`/community/discussions/${id}/vote`, { value }),
};

export const aiApi = {
  search: (query: string) => api.post('/ai/search', { query }),
  predictSalary: (data: any) => api.post('/ai/salary-predict', data),
};

export const profilesApi = {
  getMe: () => api.get('/profiles/me'),
  update: (data: any) => api.put('/profiles/me', data),
  addWorkExperience: (data: any) => api.post('/profiles/me/work-experience', data),
  addEducation: (data: any) => api.post('/profiles/me/education', data),
  addSkill: (data: any) => api.post('/profiles/me/skills', data),
  getPublic: (slug: string) => api.get(`/profiles/${slug}`),
};

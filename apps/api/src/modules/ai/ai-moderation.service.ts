import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface ModerationResult {
  spamScore: number;       // 0-1
  toxicityScore: number;   // 0-1
  qualityScore: number;    // 0-1
  isDuplicate: boolean;
  flags: string[];
}

@Injectable()
export class AiModerationService {
  private readonly logger = new Logger(AiModerationService.name);
  private openai: OpenAI;

  constructor(private config: ConfigService) {
    this.openai = new OpenAI({
      apiKey: config.get('OPENAI_API_KEY'),
    });
  }

  async moderateContent(content: string): Promise<ModerationResult> {
    if (!content || content.trim().length < 10) {
      return { spamScore: 0.9, toxicityScore: 0, qualityScore: 0.1, isDuplicate: false, flags: ['too_short'] };
    }

    try {
      // Use OpenAI moderation API first (fast & cheap)
      const moderation = await this.openai.moderations.create({ input: content });
      const result = moderation.results[0];

      const toxicityScore = result.flagged
        ? Math.max(...Object.values(result.category_scores))
        : 0;

      // Use GPT for quality and spam scoring
      const qualityResult = await this.assessQuality(content);

      return {
        spamScore: qualityResult.spamScore,
        toxicityScore,
        qualityScore: qualityResult.qualityScore,
        isDuplicate: false,
        flags: result.flagged ? Object.keys(result.categories).filter(k => (result.categories as any)[k]) : [],
      };
    } catch (error) {
      this.logger.error('AI moderation failed', error);
      // Fail open — send to manual review
      return { spamScore: 0, toxicityScore: 0, qualityScore: 0.5, isDuplicate: false, flags: ['ai_error'] };
    }
  }

  private async assessQuality(content: string): Promise<{ spamScore: number; qualityScore: number }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.get('OPENAI_MODEL', 'gpt-4o-mini'),
        messages: [
          {
            role: 'system',
            content: `You are a content quality assessor for a Persian/Iranian job review platform.
Analyze the content and return a JSON with:
- spamScore: 0-1 (1 = definitely spam/fake)
- qualityScore: 0-1 (1 = high quality, genuine review)
Consider: Is it a genuine workplace review? Does it have specific details? Is it in Persian or English? Is it repetitive/generic?
Return ONLY valid JSON.`,
          },
          {
            role: 'user',
            content: content.slice(0, 1000), // limit tokens
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 100,
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      return {
        spamScore: Math.min(1, Math.max(0, parsed.spamScore || 0)),
        qualityScore: Math.min(1, Math.max(0, parsed.qualityScore || 0.5)),
      };
    } catch {
      return { spamScore: 0, qualityScore: 0.5 };
    }
  }

  async generateCompanyReport(companyId: string, reviews: any[]): Promise<{
    strengths: string[];
    complaints: string[];
    cultureSummary: string;
    managementSummary: string;
    riskScore: number;
  }> {
    if (reviews.length < 3) {
      return {
        strengths: [],
        complaints: [],
        cultureSummary: 'داده کافی برای تحلیل وجود ندارد',
        managementSummary: 'داده کافی برای تحلیل وجود ندارد',
        riskScore: 50,
      };
    }

    const reviewText = reviews
      .slice(0, 20)
      .map(r => `مزایا: ${r.pros || ''}\nمعایب: ${r.cons || ''}\nامتیاز: ${r.ratingOverall}`)
      .join('\n---\n');

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.get('OPENAI_MODEL', 'gpt-4o'),
        messages: [
          {
            role: 'system',
            content: `شما یک تحلیلگر محیط کار هستید. بر اساس نظرات کارمندان، گزارش جامعی به فارسی تهیه کنید.
خروجی باید JSON باشد با فیلدهای:
- strengths: آرایه‌ای از نقاط قوت (حداکثر ۵ مورد)
- complaints: آرایه‌ای از مشکلات رایج (حداکثر ۵ مورد)
- cultureSummary: خلاصه فرهنگ سازمانی (۲-۳ جمله)
- managementSummary: خلاصه وضعیت مدیریت (۲-۳ جمله)
- riskScore: امتیاز ریسک ۰-۱۰۰ (۱۰۰ = بیشترین ریسک)`,
          },
          { role: 'user', content: reviewText },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 800,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Failed to generate company report', error);
      throw error;
    }
  }

  async predictSalary(params: {
    position: string;
    city: string;
    experienceYears: number;
    skills: string[];
    industry?: string;
  }): Promise<{ min: number; median: number; max: number; confidence: number }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.get('OPENAI_MODEL', 'gpt-4o-mini'),
        messages: [
          {
            role: 'system',
            content: `شما یک متخصص حقوق و دستمزد در بازار کار ایران هستید.
بر اساس اطلاعات داده شده، حقوق ماهانه را به تومان تخمین بزنید.
خروجی JSON با فیلدهای: min, median, max (به تومان), confidence (0-1)`,
          },
          {
            role: 'user',
            content: JSON.stringify(params),
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 150,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      this.logger.error('Salary prediction failed', error);
      return { min: 0, median: 0, max: 0, confidence: 0 };
    }
  }

  async naturalLanguageSearch(query: string): Promise<{
    filters: Record<string, any>;
    intent: string;
    keywords: string[];
  }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.get('OPENAI_MODEL', 'gpt-4o-mini'),
        messages: [
          {
            role: 'system',
            content: `Parse this Persian/English job search query and extract structured filters.
Return JSON with:
- filters: { city, industry, employmentType, minSalary, maxSalary, skills[], isRemote }
- intent: "jobs" | "companies" | "salaries" | "reviews"
- keywords: array of search keywords`,
          },
          { role: 'user', content: query },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 200,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch {
      return { filters: {}, intent: 'jobs', keywords: [query] };
    }
  }
}

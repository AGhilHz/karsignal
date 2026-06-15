import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * PDF Export Service
 *
 * Generates a resume PDF from a user's profile.
 * Uses a simple HTML-to-PDF approach via Puppeteer (optional dependency).
 * Falls back to returning structured data if Puppeteer is not available.
 */
@Injectable()
export class PdfExportService {
  private readonly logger = new Logger(PdfExportService.name);

  constructor(private prisma: PrismaService) {}

  async generateResumePdf(userId: string): Promise<Buffer> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        workExperiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
        skills: { include: { skill: true } },
        certifications: true,
        languages: true,
      },
    });

    if (!profile) throw new Error('Profile not found');

    const html = this.buildResumeHtml(profile);

    try {
      // Try to use Puppeteer if available (optional dependency)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const puppeteer = await (async () => {
        try { return require('puppeteer'); } catch { return null; }
      })();
      if (puppeteer) {
        const browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({
          format: 'A4',
          margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
          printBackground: true,
        });
        await browser.close();
        return Buffer.from(pdf);
      }
    } catch (error) {
      this.logger.warn('Puppeteer not available, returning HTML as buffer');
    }

    // Fallback: return HTML as buffer
    return Buffer.from(html, 'utf-8');
  }

  private buildResumeHtml(profile: any): string {
    const skills = profile.skills?.map((s: any) => s.skill.name).join('، ') || '';

    const workHtml = profile.workExperiences?.map((exp: any) => `
      <div class="item">
        <div class="item-header">
          <strong>${exp.title}</strong> — ${exp.companyName}
          <span class="date">
            ${new Date(exp.startDate).getFullYear()} —
            ${exp.isCurrent ? 'اکنون' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
          </span>
        </div>
        ${exp.description ? `<p>${exp.description}</p>` : ''}
      </div>
    `).join('') || '';

    const eduHtml = profile.educations?.map((edu: any) => `
      <div class="item">
        <div class="item-header">
          <strong>${edu.institution}</strong>
          ${edu.degree ? `— ${edu.degree}` : ''}
          ${edu.fieldOfStudy ? `در ${edu.fieldOfStudy}` : ''}
          <span class="date">
            ${edu.startDate ? new Date(edu.startDate).getFullYear() : ''} —
            ${edu.isCurrent ? 'اکنون' : edu.endDate ? new Date(edu.endDate).getFullYear() : ''}
          </span>
        </div>
      </div>
    `).join('') || '';

    return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Vazirmatn', Tahoma, sans-serif; font-size: 13px; color: #1f2937; line-height: 1.6; }
    .header { background: #1e40af; color: white; padding: 24px; margin-bottom: 20px; }
    .header h1 { font-size: 24px; font-weight: 700; }
    .header p { opacity: 0.85; margin-top: 4px; }
    .contact { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; opacity: 0.9; }
    .section { margin: 0 24px 20px; }
    .section h2 { font-size: 15px; font-weight: 700; color: #1e40af; border-bottom: 2px solid #dbeafe; padding-bottom: 6px; margin-bottom: 12px; }
    .item { margin-bottom: 12px; }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; }
    .item-header strong { font-weight: 600; }
    .date { font-size: 11px; color: #6b7280; }
    .item p { color: #4b5563; margin-top: 4px; font-size: 12px; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill-tag { background: #dbeafe; color: #1e40af; padding: 3px 10px; border-radius: 12px; font-size: 11px; }
    .footer { text-align: center; color: #9ca3af; font-size: 10px; margin-top: 30px; padding: 12px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${profile.firstName} ${profile.lastName}</h1>
    ${profile.headline ? `<p>${profile.headline}</p>` : ''}
    <div class="contact">
      ${profile.city ? `<span>📍 ${profile.city}</span>` : ''}
      ${profile.website ? `<span>🌐 ${profile.website}</span>` : ''}
    </div>
  </div>

  ${profile.bio ? `
  <div class="section">
    <h2>درباره من</h2>
    <p>${profile.bio}</p>
  </div>` : ''}

  ${workHtml ? `
  <div class="section">
    <h2>سابقه کاری</h2>
    ${workHtml}
  </div>` : ''}

  ${eduHtml ? `
  <div class="section">
    <h2>تحصیلات</h2>
    ${eduHtml}
  </div>` : ''}

  ${skills ? `
  <div class="section">
    <h2>مهارت‌ها</h2>
    <div class="skills">
      ${profile.skills.map((s: any) => `<span class="skill-tag">${s.skill.name}</span>`).join('')}
    </div>
  </div>` : ''}

  <div class="footer">
    تهیه شده با پلتفرم شفافیت شغلی
  </div>
</body>
</html>`;
  }
}

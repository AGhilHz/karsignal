import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, AddWorkExperienceDto, AddEducationDto, AddSkillDto } from './dto/profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        workExperiences: {
          include: { company: { select: { name: true, logoUrl: true } } },
          orderBy: { startDate: 'desc' },
        },
        educations: { orderBy: { startDate: 'desc' } },
        skills: { include: { skill: true } },
        certifications: true,
        projects: true,
        languages: true,
      },
    });
    if (!profile) throw new NotFoundException('پروفایل یافت نشد');
    return profile;
  }

  async getPublicProfile(slug: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { publicSlug: slug, isPublic: true },
      include: {
        workExperiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
        skills: { include: { skill: true } },
        certifications: true,
        projects: true,
        languages: true,
      },
    });
    if (!profile) throw new NotFoundException('پروفایل یافت نشد');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { userId },
      data: dto,
    });
  }

  async addWorkExperience(userId: string, dto: AddWorkExperienceDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException();
    return this.prisma.workExperience.create({
      data: { ...dto, profileId: profile.id },
    });
  }

  async deleteWorkExperience(userId: string, expId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException();
    await this.prisma.workExperience.deleteMany({
      where: { id: expId, profileId: profile.id },
    });
  }

  async addEducation(userId: string, dto: AddEducationDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException();
    return this.prisma.education.create({
      data: { ...dto, profileId: profile.id },
    });
  }

  async deleteEducation(userId: string, eduId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException();
    await this.prisma.education.deleteMany({
      where: { id: eduId, profileId: profile.id },
    });
  }

  async addSkill(userId: string, dto: AddSkillDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException();
    return this.prisma.profileSkill.upsert({
      where: { profileId_skillId: { profileId: profile.id, skillId: dto.skillId } },
      create: { profileId: profile.id, skillId: dto.skillId, level: dto.level },
      update: { level: dto.level },
    });
  }

  async removeSkill(userId: string, skillId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException();
    await this.prisma.profileSkill.deleteMany({
      where: { profileId: profile.id, skillId },
    });
  }

  async getSkills() {
    return this.prisma.skill.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, category: true },
    });
  }
}

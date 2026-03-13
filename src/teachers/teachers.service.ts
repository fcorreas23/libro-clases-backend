import { Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherAccountDto } from './dto/create-teacher-account.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeachersQueryDto } from './dto/teachers-query.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTeacherDto) {
    return this.prisma.teacher.create({ data });
  }

  async createAccount(data: CreateTeacherAccountDto) {
    const teacherRole = await this.prisma.role.findUnique({
      where: { name: 'teacher' },
    });

    if (!teacherRole) {
      throw new NotFoundException('Teacher role not found');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear();
      const prefix = `DOC-${year}-`;
      const lastTeacher = await tx.teacher.findFirst({
        where: { employeeCode: { startsWith: prefix } },
        orderBy: { employeeCode: 'desc' },
      });
      const nextNum = lastTeacher
        ? Number(lastTeacher.employeeCode.slice(prefix.length)) + 1
        : 1;
      const generatedCode = `${prefix}${String(nextNum).padStart(3, '0')}`;

      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          isActive: true,
        },
      });

      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: teacherRole.id,
        },
      });

      return tx.teacher.create({
        data: {
          userId: user.id,
          employeeCode: data.employeeCode ?? generatedCode,
          phone: data.phone,
        },
        include: {
          user: true,
        },
      });
    });
  }

  async generateCode(): Promise<{ code: string }> {
    const year = new Date().getFullYear();
    const prefix = `DOC-${year}-`;
    const lastTeacher = await this.prisma.teacher.findFirst({
      where: { employeeCode: { startsWith: prefix } },
      orderBy: { employeeCode: 'desc' },
    });
    const nextNum = lastTeacher
      ? Number(lastTeacher.employeeCode.slice(prefix.length)) + 1
      : 1;
    const code = `${prefix}${String(nextNum).padStart(3, '0')}`;
    return { code };
  }

  findAll(query: TeachersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    return this.prisma.teacher.findMany({
      where: {
        userId: query.userId,
        employeeCode: query.employeeCode
          ? { contains: query.employeeCode }
          : undefined,
        user: query.q
          ? {
              OR: [
                { email: { contains: query.q } },
                { firstName: { contains: query.q } },
                { lastName: { contains: query.q } },
              ],
            }
          : undefined,
      },
      include: {
        user: true,
        homeroomOf: true,
      },
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        homeroomOf: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher ${id} not found`);
    }

    return teacher;
  }

  async findByUserId(userId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: true,
        homeroomOf: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher for user ${userId} not found`);
    }

    return teacher;
  }

  async update(id: number, data: UpdateTeacherDto) {
    await this.findOne(id);
    return this.prisma.teacher.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.teacher.delete({ where: { id } });
  }
}

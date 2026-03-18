import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentsQueryDto } from './dto/students-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureTeacherContext(user: AuthenticatedUser) {
    if (!user.teacherId) {
      throw new ForbiddenException('Teacher profile is required');
    }

    return user.teacherId;
  }

  private async ensureTeacherCourseAccess(
    teacherId: number,
    courseId?: number,
  ) {
    if (!courseId) {
      throw new ForbiddenException('Teachers must filter students by courseId');
    }

    const [assignment, homeroom] = await Promise.all([
      this.prisma.courseSubject.findFirst({
        where: {
          courseId,
          teacherId,
        },
      }),
      this.prisma.course.findFirst({
        where: {
          id: courseId,
          homeroomTeacherId: teacherId,
        },
      }),
    ]);

    if (!assignment && !homeroom) {
      throw new ForbiddenException('Teacher is not assigned to this course');
    }
  }

  create(data: CreateStudentDto) {
    return this.prisma.student.create({
      data: {
        studentCode: data.studentCode,
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        rut: data.rut ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        contactName: data.contactName ?? null,
        contactPhone: data.contactPhone ?? null,
        contactEmail: data.contactEmail ?? null,
        entrySchoolYearId: data.entrySchoolYearId ?? null,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll(query: StudentsQueryDto, user: AuthenticatedUser) {
    if (user.roles.includes('teacher')) {
      await this.ensureTeacherCourseAccess(
        this.ensureTeacherContext(user),
        query.courseId,
      );
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.StudentWhereInput = {
      isActive:
        query.isActive === undefined ? undefined : query.isActive === 'true',
      OR: query.q
        ? [
            { studentCode: { contains: query.q } },
            { firstName: { contains: query.q } },
            { lastName: { contains: query.q } },
            { rut: { contains: query.q } },
            { email: { contains: query.q } },
            { contactName: { contains: query.q } },
            { contactEmail: { contains: query.q } },
          ]
        : undefined,
      enrollments: query.courseId
        ? {
            some: {
              courseId: query.courseId,
            },
          }
        : undefined,
    };

    return this.prisma.student.findMany({
      where,
      include: {
        entrySchoolYear: true,
        enrollments: {
          include: {
            course: true,
            schoolYear: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number, user?: AuthenticatedUser) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        entrySchoolYear: true,
        enrollments: {
          include: {
            course: true,
            schoolYear: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException(`Student ${id} not found`);
    }

    if (user?.roles.includes('teacher')) {
      const teacherId = this.ensureTeacherContext(user);
      const allowedByHomeroom = student.enrollments.some(
        (enrollment) => enrollment.course.homeroomTeacherId === teacherId,
      );

      if (!allowedByHomeroom) {
        const courseIds = student.enrollments.map(
          (enrollment) => enrollment.course.id,
        );
        const assignment = await this.prisma.courseSubject.findFirst({
          where: {
            teacherId,
            courseId: { in: courseIds },
          },
        });

        if (!assignment) {
          throw new ForbiddenException('Teacher cannot access this student');
        }
      }
    }

    return student;
  }

  async update(id: number, data: UpdateStudentDto) {
    await this.findOne(id);
    return this.prisma.student.update({
      where: { id },
      data: {
        studentCode: data.studentCode,
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate:
          data.birthDate === undefined
            ? undefined
            : data.birthDate
              ? new Date(data.birthDate)
              : null,
        rut: data.rut,
        email: data.email,
        phone: data.phone,
        address: data.address,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        entrySchoolYearId: data.entrySchoolYearId,
        isActive: data.isActive,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.student.delete({
      where: { id },
    });
  }

  async generateCode(): Promise<{ code: string }> {
    const year = new Date().getFullYear();
    const prefix = `STU-${year}-`;
    const last = await this.prisma.student.findFirst({
      where: { studentCode: { startsWith: prefix } },
      orderBy: { studentCode: 'desc' },
    });
    const nextNum = last
      ? Number(last.studentCode.slice(prefix.length)) + 1
      : 1;
    const code = `${prefix}${String(nextNum).padStart(3, '0')}`;
    return { code };
  }
}

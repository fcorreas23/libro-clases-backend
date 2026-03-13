import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { GradesQueryDto } from './dto/grades-query.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureTeacherContext(user: AuthenticatedUser) {
    if (!user.teacherId) {
      throw new ForbiddenException('Teacher profile is required');
    }

    return user.teacherId;
  }

  private async ensureStudentEnrollment(
    studentId: number,
    courseId: number,
    schoolYearId: number,
  ) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        schoolYearId,
      },
    });

    if (!enrollment) {
      throw new BadRequestException(
        'Student is not enrolled in the provided course/school year',
      );
    }
  }

  private async ensureTeacherCourseSubject(
    courseSubjectId: number,
    courseId: number,
    subjectId: number,
    teacherId: number,
  ) {
    const courseSubject = await this.prisma.courseSubject.findUnique({
      where: { id: courseSubjectId },
    });

    if (!courseSubject) {
      throw new BadRequestException('CourseSubject does not exist');
    }

    if (courseSubject.courseId !== courseId || courseSubject.subjectId !== subjectId) {
      throw new BadRequestException(
        'courseId and subjectId must match the provided courseSubjectId',
      );
    }

    if (courseSubject.teacherId !== teacherId) {
      throw new BadRequestException(
        'Teacher is not assigned to this course subject',
      );
    }
  }

  async create(data: CreateGradeDto, user: AuthenticatedUser) {
    if (data.value < 1 || data.value > 7) {
      throw new BadRequestException('Grade value must be between 1.0 and 7.0');
    }

    if (user.roles.includes('teacher')) {
      const teacherId = this.ensureTeacherContext(user);
      if (data.teacherId !== teacherId) {
        throw new ForbiddenException('Teachers can only create grades using their own teacherId');
      }
    }

    await this.ensureStudentEnrollment(data.studentId, data.courseId, data.schoolYearId);
    await this.ensureTeacherCourseSubject(
      data.courseSubjectId,
      data.courseId,
      data.subjectId,
      data.teacherId,
    );

    return this.prisma.grade.create({
      data: {
        ...data,
        value: new Prisma.Decimal(data.value),
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
      },
    });
  }

  findAll(query: GradesQueryDto, user: AuthenticatedUser) {
    const teacherId = user.roles.includes('teacher')
      ? this.ensureTeacherContext(user)
      : query.teacherId;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.GradeWhereInput = {
      studentId: query.studentId,
      courseId: query.courseId,
      schoolYearId: query.schoolYearId,
      subjectId: query.subjectId,
      teacherId,
      value:
        query.minValue !== undefined || query.maxValue !== undefined
          ? {
              gte:
                query.minValue !== undefined
                  ? new Prisma.Decimal(query.minValue)
                  : undefined,
              lte:
                query.maxValue !== undefined
                  ? new Prisma.Decimal(query.maxValue)
                  : undefined,
            }
          : undefined,
    };

    return this.prisma.grade.findMany({
      where,
      include: {
        student: true,
        course: true,
        schoolYear: true,
        subject: true,
        teacher: {
          include: {
            user: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: [{ recordedAt: 'desc' }, { id: 'desc' }],
    });
  }

  async findOne(id: number, user: AuthenticatedUser) {
    const grade = await this.prisma.grade.findUnique({
      where: { id },
      include: {
        student: true,
        course: true,
        schoolYear: true,
        subject: true,
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!grade) {
      throw new NotFoundException(`Grade ${id} not found`);
    }

    if (user.roles.includes('teacher')) {
      const teacherId = this.ensureTeacherContext(user);
      if (grade.teacherId !== teacherId) {
        throw new ForbiddenException('Teachers can only access their own grades');
      }
    }

    return grade;
  }

  async update(id: number, data: UpdateGradeDto, user: AuthenticatedUser) {
    await this.findOne(id, user);

    if (data.value !== undefined && (data.value < 1 || data.value > 7)) {
      throw new BadRequestException('Grade value must be between 1.0 and 7.0');
    }

    return this.prisma.grade.update({
      where: { id },
      data: {
        title: data.title,
        value: data.value !== undefined ? new Prisma.Decimal(data.value) : undefined,
        observations: data.observations,
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined,
      },
    });
  }

  async remove(id: number, user: AuthenticatedUser) {
    await this.findOne(id, user);
    return this.prisma.grade.delete({
      where: { id },
    });
  }
}

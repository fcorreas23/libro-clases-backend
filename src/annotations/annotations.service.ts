import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnnotationType, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { AnnotationsQueryDto } from './dto/annotations-query.dto';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';

const INTERNAL_ROLES = new Set(['admin', 'director', 'utp', 'teacher']);

@Injectable()
export class AnnotationsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureTeacherContext(user: AuthenticatedUser) {
    if (!user.teacherId) {
      throw new ForbiddenException('Teacher profile is required');
    }

    return user.teacherId;
  }

  private async ensureTeacherCourseAccess(teacherId: number, courseId: number) {
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

  private ensureNegativeVisibility(
    includeNegative: boolean | undefined,
    viewerRole: string | undefined,
  ) {
    if (includeNegative && !viewerRole) {
      throw new ForbiddenException(
        'viewerRole is required to include negative annotations',
      );
    }

    if (includeNegative && viewerRole && !INTERNAL_ROLES.has(viewerRole)) {
      throw new ForbiddenException(
        'Negative annotations are only visible to internal roles',
      );
    }
  }

  async create(data: CreateAnnotationDto, user: AuthenticatedUser) {
    if (user.roles.includes('teacher')) {
      const teacherId = this.ensureTeacherContext(user);
      if (data.teacherId !== teacherId) {
        throw new ForbiddenException(
          'Teachers can only create annotations using their own teacherId',
        );
      }
      await this.ensureTeacherCourseAccess(teacherId, data.courseId);
    }

    await this.ensureStudentEnrollment(
      data.studentId,
      data.courseId,
      data.schoolYearId,
    );

    return this.prisma.annotation.create({
      data: {
        ...data,
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
      },
    });
  }

  findAll(query: AnnotationsQueryDto, user: AuthenticatedUser) {
    const isTeacher = user.roles.includes('teacher');
    const teacherId = isTeacher
      ? this.ensureTeacherContext(user)
      : query.teacherId;
    const viewerRole = isTeacher ? 'teacher' : query.viewerRole;

    this.ensureNegativeVisibility(query.includeNegative, viewerRole);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    let typeFilter: AnnotationType | { not: AnnotationType } | undefined;
    if (query.type) {
      typeFilter = query.type;
      if (query.type === AnnotationType.negative) {
        this.ensureNegativeVisibility(true, viewerRole);
      }
    } else {
      typeFilter = query.includeNegative
        ? undefined
        : { not: AnnotationType.negative };
    }

    const where: Prisma.AnnotationWhereInput = {
      studentId: query.studentId,
      courseId: query.courseId,
      schoolYearId: query.schoolYearId,
      teacherId,
      type: typeFilter,
    };

    return this.prisma.annotation.findMany({
      where,
      include: {
        student: true,
        course: true,
        schoolYear: true,
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

  async findOne(id: number, user: AuthenticatedUser, viewerRole?: string) {
    const annotation = await this.prisma.annotation.findUnique({
      where: { id },
      include: {
        student: true,
        course: true,
        schoolYear: true,
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!annotation) {
      throw new NotFoundException(`Annotation ${id} not found`);
    }

    if (user.roles.includes('teacher')) {
      const teacherId = this.ensureTeacherContext(user);
      if (annotation.teacherId !== teacherId) {
        throw new ForbiddenException(
          'Teachers can only access their own annotations',
        );
      }
    }

    if (annotation.type === AnnotationType.negative) {
      this.ensureNegativeVisibility(
        true,
        user.roles.includes('teacher') ? 'teacher' : viewerRole,
      );
    }

    return annotation;
  }

  async update(id: number, data: UpdateAnnotationDto, user: AuthenticatedUser) {
    await this.findOne(id, user, 'teacher');
    return this.prisma.annotation.update({
      where: { id },
      data: {
        type: data.type,
        content: data.content,
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined,
      },
    });
  }

  async remove(id: number, user: AuthenticatedUser) {
    await this.findOne(id, user, 'teacher');
    return this.prisma.annotation.delete({
      where: { id },
    });
  }
}

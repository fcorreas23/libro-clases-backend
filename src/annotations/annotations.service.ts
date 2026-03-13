import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AnnotationType,
  Prisma,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { AnnotationsQueryDto } from './dto/annotations-query.dto';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';

const INTERNAL_ROLES = new Set(['admin', 'director', 'utp', 'teacher']);

@Injectable()
export class AnnotationsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(data: CreateAnnotationDto) {
    await this.ensureStudentEnrollment(data.studentId, data.courseId, data.schoolYearId);

    return this.prisma.annotation.create({
      data: {
        ...data,
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
      },
    });
  }

  findAll(query: AnnotationsQueryDto) {
    this.ensureNegativeVisibility(query.includeNegative, query.viewerRole);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    let typeFilter: AnnotationType | { not: AnnotationType } | undefined;
    if (query.type) {
      typeFilter = query.type;
      if (query.type === AnnotationType.negative) {
        this.ensureNegativeVisibility(true, query.viewerRole);
      }
    } else {
      typeFilter = query.includeNegative ? undefined : { not: AnnotationType.negative };
    }

    const where: Prisma.AnnotationWhereInput = {
      studentId: query.studentId,
      courseId: query.courseId,
      schoolYearId: query.schoolYearId,
      teacherId: query.teacherId,
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

  async findOne(id: number, viewerRole?: string) {
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

    if (annotation.type === AnnotationType.negative) {
      this.ensureNegativeVisibility(true, viewerRole);
    }

    return annotation;
  }

  async update(id: number, data: UpdateAnnotationDto) {
    await this.findOne(id, 'teacher');
    return this.prisma.annotation.update({
      where: { id },
      data: {
        type: data.type,
        content: data.content,
        recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id, 'teacher');
    return this.prisma.annotation.delete({
      where: { id },
    });
  }
}

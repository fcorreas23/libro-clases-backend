import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBulkEnrollmentDto } from './dto/create-bulk-enrollment.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateEnrollmentDto) {
    return this.prisma.enrollment.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        schoolYearId: data.schoolYearId,
        status: data.status ?? 'active',
      },
    });
  }

  async createBulk(data: CreateBulkEnrollmentDto) {
    const uniqueStudentIds = [...new Set(data.studentIds)].filter((id) => id > 0);

    if (uniqueStudentIds.length === 0) {
      return {
        requested: 0,
        created: 0,
        skipped: 0,
        skippedStudentIds: [] as number[],
      };
    }

    const existing = await this.prisma.enrollment.findMany({
      where: {
        schoolYearId: data.schoolYearId,
        studentId: { in: uniqueStudentIds },
      },
      select: { studentId: true },
    });

    const existingStudentIds = new Set(existing.map((item) => item.studentId));
    const createStudentIds = uniqueStudentIds.filter(
      (studentId) => !existingStudentIds.has(studentId),
    );

    if (createStudentIds.length > 0) {
      await this.prisma.enrollment.createMany({
        data: createStudentIds.map((studentId) => ({
          studentId,
          courseId: data.courseId,
          schoolYearId: data.schoolYearId,
          status: data.status ?? 'active',
        })),
      });
    }

    return {
      requested: uniqueStudentIds.length,
      created: createStudentIds.length,
      skipped: uniqueStudentIds.length - createStudentIds.length,
      skippedStudentIds: uniqueStudentIds.filter((studentId) =>
        existingStudentIds.has(studentId),
      ),
    };
  }

  findAll(query: EnrollmentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.EnrollmentWhereInput = {
      studentId: query.studentId,
      courseId: query.courseId,
      schoolYearId: query.schoolYearId,
      status: query.status ? { contains: query.status } : undefined,
    };

    return this.prisma.enrollment.findMany({
      where,
      include: {
        student: true,
        course: true,
        schoolYear: true,
      },
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: true,
        course: true,
        schoolYear: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment ${id} not found`);
    }

    return enrollment;
  }

  async update(id: number, data: UpdateEnrollmentDto) {
    await this.findOne(id);
    return this.prisma.enrollment.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.enrollment.delete({
      where: { id },
    });
  }
}

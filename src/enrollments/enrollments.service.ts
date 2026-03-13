import { Prisma } from '../../generated/prisma/client.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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

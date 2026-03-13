import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentsQueryDto } from './dto/students-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

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
        isActive: data.isActive ?? true,
      },
    });
  }

  findAll(query: StudentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.StudentWhereInput = {
      isActive:
        query.isActive === undefined
          ? undefined
          : query.isActive === 'true',
      OR: query.q
        ? [
            { studentCode: { contains: query.q } },
            { firstName: { contains: query.q } },
            { lastName: { contains: query.q } },
            { rut: { contains: query.q } },
            { email: { contains: query.q } },
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

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
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
}

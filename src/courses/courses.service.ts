import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CoursesQueryDto } from './dto/courses-query.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCourseDto) {
    return this.prisma.course.create({
      data,
    });
  }

  findAll(query: CoursesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.CourseWhereInput = {
      schoolYearId: query.schoolYearId,
      level: query.level ? { contains: query.level } : undefined,
      letter: query.letter ? { contains: query.letter } : undefined,
      OR: query.q
        ? [
            { name: { contains: query.q } },
            { level: { contains: query.q } },
            { letter: { contains: query.q } },
          ]
        : undefined,
    };

    return this.prisma.course.findMany({
      where,
      include: {
        schoolYear: true,
        homeroomTeacher: {
          include: {
            user: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        schoolYear: true,
        homeroomTeacher: {
          include: {
            user: true,
          },
        },
        enrollments: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course ${id} not found`);
    }

    return course;
  }

  async update(id: number, data: UpdateCourseDto) {
    await this.findOne(id);
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.course.delete({
      where: { id },
    });
  }
}

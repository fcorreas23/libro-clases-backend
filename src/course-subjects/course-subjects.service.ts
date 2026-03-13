import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CourseSubjectsQueryDto } from './dto/course-subjects-query.dto';
import { CreateCourseSubjectDto } from './dto/create-course-subject.dto';
import { UpdateCourseSubjectDto } from './dto/update-course-subject.dto';

@Injectable()
export class CourseSubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCourseSubjectDto) {
    return this.prisma.courseSubject.create({
      data,
    });
  }

  findAll(query: CourseSubjectsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.CourseSubjectWhereInput = {
      courseId: query.courseId,
      subjectId: query.subjectId,
      teacherId: query.teacherId,
    };

    return this.prisma.courseSubject.findMany({
      where,
      include: {
        course: true,
        subject: true,
        teacher: {
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
    const courseSubject = await this.prisma.courseSubject.findUnique({
      where: { id },
      include: {
        course: true,
        subject: true,
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!courseSubject) {
      throw new NotFoundException(`CourseSubject ${id} not found`);
    }

    return courseSubject;
  }

  async update(id: number, data: UpdateCourseSubjectDto) {
    await this.findOne(id);
    return this.prisma.courseSubject.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.courseSubject.delete({
      where: { id },
    });
  }
}

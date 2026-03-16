import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CourseSubjectsQueryDto } from './dto/course-subjects-query.dto';
import { CreateCourseSubjectDto } from './dto/create-course-subject.dto';
import { UpdateCourseSubjectDto } from './dto/update-course-subject.dto';

@Injectable()
export class CourseSubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureTeacherContext(user: AuthenticatedUser) {
    if (!user.teacherId) {
      throw new ForbiddenException('Teacher profile is required');
    }

    return user.teacherId;
  }

  create(data: CreateCourseSubjectDto) {
    return this.prisma.courseSubject.create({
      data,
    });
  }

  findAll(query: CourseSubjectsQueryDto, user: AuthenticatedUser) {
    const teacherId = user.roles.includes('teacher')
      ? this.ensureTeacherContext(user)
      : query.teacherId;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.CourseSubjectWhereInput = {
      courseId: query.courseId,
      subjectId: query.subjectId,
      teacherId,
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

  async findOne(id: number, user?: AuthenticatedUser) {
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

    if (user?.roles.includes('teacher')) {
      const teacherId = this.ensureTeacherContext(user);
      if (courseSubject.teacherId !== teacherId) {
        throw new ForbiddenException('Teachers can only access their own course subjects');
      }
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

    // Check for dependent grades that reference this course_subject.
    const dependentGrades = await this.prisma.grade.count({ where: { courseSubjectId: id } });
    if (dependentGrades > 0) {
      throw new ForbiddenException(`No se puede eliminar la asignación: existen ${dependentGrades} calificaciones asociadas. Elimine o reasocie esas calificaciones antes de borrar la asignación.`);
    }

    return this.prisma.courseSubject.delete({ where: { id } });
  }
}

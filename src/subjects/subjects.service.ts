import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { SubjectsQueryDto } from './dto/subjects-query.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSubjectDto) {
    return this.prisma.subject.create({
      data,
    });
  }

  findAll(query: SubjectsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.SubjectWhereInput = {
      OR: query.q
        ? [{ name: { contains: query.q } }, { code: { contains: query.q } }]
        : undefined,
    };

    return this.prisma.subject.findMany({
      where,
      include: {
        courseSubjects: {
          include: {
            course: true,
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        courseSubjects: {
          include: {
            course: true,
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject ${id} not found`);
    }

    return subject;
  }

  async update(id: number, data: UpdateSubjectDto) {
    await this.findOne(id);
    return this.prisma.subject.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.subject.delete({
      where: { id },
    });
  }
}

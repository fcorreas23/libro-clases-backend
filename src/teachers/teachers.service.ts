import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeachersQueryDto } from './dto/teachers-query.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTeacherDto) {
    return this.prisma.teacher.create({ data });
  }

  findAll(query: TeachersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    return this.prisma.teacher.findMany({
      where: {
        userId: query.userId,
        employeeCode: query.employeeCode
          ? { contains: query.employeeCode }
          : undefined,
        user: query.q
          ? {
              OR: [
                { email: { contains: query.q } },
                { firstName: { contains: query.q } },
                { lastName: { contains: query.q } },
              ],
            }
          : undefined,
      },
      include: {
        user: true,
        homeroomOf: true,
      },
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        homeroomOf: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher ${id} not found`);
    }

    return teacher;
  }

  async update(id: number, data: UpdateTeacherDto) {
    await this.findOne(id);
    return this.prisma.teacher.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.teacher.delete({ where: { id } });
  }
}

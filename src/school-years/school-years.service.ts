import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { SchoolYearsQueryDto } from './dto/school-years-query.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';

@Injectable()
export class SchoolYearsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateSchoolYearDto) {
    return this.prisma.schoolYear.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? false,
      },
    });
  }

  findAll(query: SchoolYearsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.SchoolYearWhereInput = {
      name: query.name ? { contains: query.name } : undefined,
      isActive:
        query.isActive === undefined ? undefined : query.isActive === 'true',
    };

    return this.prisma.schoolYear.findMany({
      where,
      include: {
        courses: true,
      },
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: { id },
      include: {
        courses: true,
        enrollments: true,
      },
    });

    if (!schoolYear) {
      throw new NotFoundException(`SchoolYear ${id} not found`);
    }

    return schoolYear;
  }

  async update(id: number, data: UpdateSchoolYearDto) {
    await this.findOne(id);
    return this.prisma.schoolYear.update({
      where: { id },
      data: {
        name: data.name,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        isActive: data.isActive,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.schoolYear.delete({
      where: { id },
    });
  }
}

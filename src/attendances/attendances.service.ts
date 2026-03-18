import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';
import { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceDailySummaryQueryDto } from './dto/attendance-daily-summary-query.dto';
import { AttendanceRangeSummaryQueryDto } from './dto/attendance-range-summary-query.dto';
import { AttendancesQueryDto } from './dto/attendances-query.dto';
import { BulkUpsertAttendanceDto } from './dto/bulk-upsert-attendance.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendancesService {
  constructor(private readonly prisma: PrismaService) {}

  private ensureTeacherContext(user: AuthenticatedUser) {
    if (!user.teacherId) {
      throw new ForbiddenException('Teacher profile is required');
    }

    return user.teacherId;
  }

  private async ensureTeacherCourseAccess(teacherId: number, courseId: number) {
    const [assignment, homeroom] = await Promise.all([
      this.prisma.courseSubject.findFirst({
        where: {
          courseId,
          teacherId,
        },
      }),
      this.prisma.course.findFirst({
        where: {
          id: courseId,
          homeroomTeacherId: teacherId,
        },
      }),
    ]);

    if (!assignment && !homeroom) {
      throw new ForbiddenException('Teacher is not assigned to this course');
    }
  }

  private normalizeDate(dateInput: string) {
    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid attendance date');
    }

    return date;
  }

  private dayRange(dateInput: string) {
    const parsed = this.normalizeDate(dateInput);
    const start = new Date(parsed);
    start.setHours(0, 0, 0, 0);

    const end = new Date(parsed);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  private emptyStatusCounts() {
    return {
      present: 0,
      absent: 0,
      late: 0,
      justified_absence: 0,
    };
  }

  private dateToDayKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }

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
        `Student ${studentId} is not enrolled in course ${courseId} for school year ${schoolYearId}`,
      );
    }
  }

  async create(data: CreateAttendanceDto, user: AuthenticatedUser) {
    if (user.roles.includes('teacher')) {
      const teacherId = this.ensureTeacherContext(user);
      if (data.takenByTeacherId !== teacherId) {
        throw new ForbiddenException(
          'Teachers can only record attendance with their own teacherId',
        );
      }
      await this.ensureTeacherCourseAccess(teacherId, data.courseId);
    }

    await this.ensureStudentEnrollment(
      data.studentId,
      data.courseId,
      data.schoolYearId,
    );

    return this.prisma.attendance.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        schoolYearId: data.schoolYearId,
        takenByTeacherId: data.takenByTeacherId,
        date: this.normalizeDate(data.date),
        status: data.status,
        notes: data.notes,
      },
    });
  }

  async bulkUpsert(data: BulkUpsertAttendanceDto, user: AuthenticatedUser) {
    if (user.roles.includes('teacher')) {
      const teacherId = this.ensureTeacherContext(user);
      if (data.takenByTeacherId !== teacherId) {
        throw new ForbiddenException(
          'Teachers can only record attendance with their own teacherId',
        );
      }
      await this.ensureTeacherCourseAccess(teacherId, data.courseId);
    }

    const seen = new Set<number>();
    for (const record of data.records) {
      if (seen.has(record.studentId)) {
        throw new BadRequestException(
          `Duplicate studentId ${record.studentId} in records`,
        );
      }
      seen.add(record.studentId);
      await this.ensureStudentEnrollment(
        record.studentId,
        data.courseId,
        data.schoolYearId,
      );
    }

    const date = this.normalizeDate(data.date);
    const operations = data.records.map((record) =>
      this.prisma.attendance.upsert({
        where: {
          studentId_courseId_schoolYearId_date: {
            studentId: record.studentId,
            courseId: data.courseId,
            schoolYearId: data.schoolYearId,
            date,
          },
        },
        update: {
          status: record.status,
          notes: record.notes,
          takenByTeacherId: data.takenByTeacherId,
        },
        create: {
          studentId: record.studentId,
          courseId: data.courseId,
          schoolYearId: data.schoolYearId,
          takenByTeacherId: data.takenByTeacherId,
          date,
          status: record.status,
          notes: record.notes,
        },
      }),
    );

    return this.prisma.$transaction(operations);
  }

  findAll(query: AttendancesQueryDto, user: AuthenticatedUser) {
    const takenByTeacherId = user.roles.includes('teacher')
      ? this.ensureTeacherContext(user)
      : query.takenByTeacherId;

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {
      studentId: query.studentId,
      courseId: query.courseId,
      schoolYearId: query.schoolYearId,
      takenByTeacherId,
      status: query.status,
      date:
        query.dateFrom || query.dateTo
          ? {
              gte: query.dateFrom ? new Date(query.dateFrom) : undefined,
              lte: query.dateTo ? new Date(query.dateTo) : undefined,
            }
          : undefined,
    };

    return this.prisma.attendance.findMany({
      where,
      include: {
        student: true,
        course: true,
        schoolYear: true,
        takenByTeacher: {
          include: {
            user: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });
  }

  async getDailySummary(
    query: AttendanceDailySummaryQueryDto,
    user: AuthenticatedUser,
  ) {
    if (user.roles.includes('teacher')) {
      await this.ensureTeacherCourseAccess(
        this.ensureTeacherContext(user),
        query.courseId,
      );
    }

    const { start, end } = this.dayRange(query.date);

    const [statusCounts, enrolledCount] = await Promise.all([
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: {
          courseId: query.courseId,
          schoolYearId: query.schoolYearId,
          date: {
            gte: start,
            lte: end,
          },
        },
        _count: {
          _all: true,
        },
      }),
      this.prisma.enrollment.count({
        where: {
          courseId: query.courseId,
          schoolYearId: query.schoolYearId,
        },
      }),
    ]);

    const counts = this.emptyStatusCounts();

    for (const item of statusCounts) {
      counts[item.status] = item._count._all;
    }

    const takenCount =
      counts.present + counts.absent + counts.late + counts.justified_absence;

    const attendanceRate =
      enrolledCount === 0
        ? 0
        : Number(
            (((counts.present + counts.late) / enrolledCount) * 100).toFixed(2),
          );

    return {
      courseId: query.courseId,
      schoolYearId: query.schoolYearId,
      date: start.toISOString(),
      counts,
      totals: {
        enrolledCount,
        takenCount,
        missingCount: Math.max(enrolledCount - takenCount, 0),
      },
      attendanceRate,
      statusCatalog: Object.values(AttendanceStatus),
    };
  }

  async getDailySummaryRange(
    query: AttendanceRangeSummaryQueryDto,
    user: AuthenticatedUser,
  ) {
    if (user.roles.includes('teacher')) {
      await this.ensureTeacherCourseAccess(
        this.ensureTeacherContext(user),
        query.courseId,
      );
    }

    const { start: rangeStart } = this.dayRange(query.dateFrom);
    const { end: rangeEnd } = this.dayRange(query.dateTo);

    if (rangeStart > rangeEnd) {
      throw new BadRequestException(
        'dateFrom must be lower than or equal to dateTo',
      );
    }

    const [attendances, enrolledCount] = await Promise.all([
      this.prisma.attendance.findMany({
        where: {
          courseId: query.courseId,
          schoolYearId: query.schoolYearId,
          date: {
            gte: rangeStart,
            lte: rangeEnd,
          },
        },
        select: {
          date: true,
          status: true,
        },
      }),
      this.prisma.enrollment.count({
        where: {
          courseId: query.courseId,
          schoolYearId: query.schoolYearId,
        },
      }),
    ]);

    const summaryByDay = new Map<
      string,
      {
        counts: ReturnType<AttendancesService['emptyStatusCounts']>;
      }
    >();

    for (const record of attendances) {
      const key = this.dateToDayKey(record.date);
      const current = summaryByDay.get(key) ?? {
        counts: this.emptyStatusCounts(),
      };
      current.counts[record.status] += 1;
      summaryByDay.set(key, current);
    }

    const days: Array<{
      date: string;
      counts: ReturnType<AttendancesService['emptyStatusCounts']>;
      totals: {
        enrolledCount: number;
        takenCount: number;
        missingCount: number;
      };
      attendanceRate: number;
    }> = [];

    const cursor = new Date(rangeStart);
    while (cursor <= rangeEnd) {
      const key = this.dateToDayKey(cursor);
      const counts = summaryByDay.get(key)?.counts ?? this.emptyStatusCounts();
      const takenCount =
        counts.present + counts.absent + counts.late + counts.justified_absence;
      const attendanceRate =
        enrolledCount === 0
          ? 0
          : Number(
              (((counts.present + counts.late) / enrolledCount) * 100).toFixed(
                2,
              ),
            );

      days.push({
        date: key,
        counts,
        totals: {
          enrolledCount,
          takenCount,
          missingCount: Math.max(enrolledCount - takenCount, 0),
        },
        attendanceRate,
      });

      cursor.setDate(cursor.getDate() + 1);
      cursor.setHours(0, 0, 0, 0);
    }

    const rangeCounts = this.emptyStatusCounts();
    for (const day of days) {
      rangeCounts.present += day.counts.present;
      rangeCounts.absent += day.counts.absent;
      rangeCounts.late += day.counts.late;
      rangeCounts.justified_absence += day.counts.justified_absence;
    }

    const daysCount = days.length;
    const expectedRecords = enrolledCount * daysCount;
    const takenCount =
      rangeCounts.present +
      rangeCounts.absent +
      rangeCounts.late +
      rangeCounts.justified_absence;
    const attendanceRate =
      expectedRecords === 0
        ? 0
        : Number(
            (
              ((rangeCounts.present + rangeCounts.late) / expectedRecords) *
              100
            ).toFixed(2),
          );

    return {
      courseId: query.courseId,
      schoolYearId: query.schoolYearId,
      dateFrom: this.dateToDayKey(rangeStart),
      dateTo: this.dateToDayKey(rangeEnd),
      statusCatalog: Object.values(AttendanceStatus),
      days,
      rangeTotals: {
        daysCount,
        enrolledCount,
        expectedRecords,
        takenCount,
        missingCount: Math.max(expectedRecords - takenCount, 0),
        counts: rangeCounts,
        attendanceRate,
      },
    };
  }

  async findOne(id: number, user: AuthenticatedUser) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        student: true,
        course: true,
        schoolYear: true,
        takenByTeacher: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance ${id} not found`);
    }

    if (user.roles.includes('teacher')) {
      const teacherId = this.ensureTeacherContext(user);
      if (attendance.takenByTeacherId !== teacherId) {
        throw new ForbiddenException(
          'Teachers can only access their own attendance records',
        );
      }
    }

    return attendance;
  }

  async update(id: number, data: UpdateAttendanceDto, user: AuthenticatedUser) {
    await this.findOne(id, user);

    return this.prisma.attendance.update({
      where: { id },
      data: {
        date: data.date ? this.normalizeDate(data.date) : undefined,
        status: data.status,
        notes: data.notes,
      },
    });
  }

  async remove(id: number, user: AuthenticatedUser) {
    await this.findOne(id, user);
    return this.prisma.attendance.delete({
      where: { id },
    });
  }
}

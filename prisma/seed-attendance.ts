import { AttendanceStatus } from '../generated/prisma/enums.js';
import { prisma } from './seed-client.js';
import { coursesToSeed, studentsToSeed, toCourseKey } from './seed-data.js';

type LookupMap = Map<string, { id: number }>;

const WEEK_DATES = ['2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13'];
const STATUS_ROTATION: AttendanceStatus[] = [
  AttendanceStatus.present,
  AttendanceStatus.present,
  AttendanceStatus.late,
  AttendanceStatus.absent,
  AttendanceStatus.justified_absence,
];

function toUtcDate(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function defaultNote(status: AttendanceStatus) {
  if (status === AttendanceStatus.late) {
    return 'Atraso menor durante la primera hora';
  }

  if (status === AttendanceStatus.absent) {
    return 'Inasistencia sin justificativo';
  }

  if (status === AttendanceStatus.justified_absence) {
    return 'Inasistencia justificada por apoderado';
  }

  return undefined;
}

export async function seedAttendanceWeek(params: {
  schoolYearId: number;
  courseByKey: LookupMap;
  studentByCode: LookupMap;
  teacherByEmail: LookupMap;
}) {
  const { schoolYearId, courseByKey, studentByCode, teacherByEmail } = params;

  const teacherByCourseKey = new Map<string, { id: number }>();
  for (const course of coursesToSeed) {
    const key = toCourseKey(course.level, course.letter);
    const teacher = teacherByEmail.get(course.homeroomTeacherEmail);

    if (teacher) {
      teacherByCourseKey.set(key, teacher);
    }
  }

  for (const studentData of studentsToSeed) {
    const student = studentByCode.get(studentData.studentCode);
    const courseKey = toCourseKey(studentData.courseLevel, studentData.courseLetter);
    const course = courseByKey.get(courseKey);
    const teacher = teacherByCourseKey.get(courseKey);

    if (!student || !course) {
      throw new Error(`Invalid attendance seed data for ${studentData.studentCode}`);
    }

    for (let dayIndex = 0; dayIndex < WEEK_DATES.length; dayIndex += 1) {
      const status = STATUS_ROTATION[(dayIndex + student.id) % STATUS_ROTATION.length];
      const date = toUtcDate(WEEK_DATES[dayIndex]);

      await prisma.attendance.upsert({
        where: {
          studentId_courseId_schoolYearId_date: {
            studentId: student.id,
            courseId: course.id,
            schoolYearId,
            date,
          },
        },
        update: {
          status,
          notes: defaultNote(status),
          takenByTeacherId: teacher?.id,
        },
        create: {
          studentId: student.id,
          courseId: course.id,
          schoolYearId,
          date,
          status,
          notes: defaultNote(status),
          takenByTeacherId: teacher?.id,
        },
      });
    }
  }

  return { daysSeeded: WEEK_DATES.length, studentsSeeded: studentsToSeed.length };
}

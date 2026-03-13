import { prisma } from './seed-client.js';
import {
  courseSubjectsToSeed,
  coursesToSeed,
  subjectsToSeed,
  type SeededUser,
  teacherProfiles,
  toCourseKey,
  toCourseSubjectKey,
} from './seed-data.js';

export async function seedSchoolStructure(users: SeededUser[]) {
  const schoolYear = await prisma.schoolYear.upsert({
    where: { name: '2026' },
    update: {
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
    create: {
      name: '2026',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  });

  const userByEmail = new Map(users.map((user) => [user.email, user]));
  const teacherByEmail = new Map<string, { id: number }>();

  for (const teacherProfile of teacherProfiles) {
    const user = userByEmail.get(teacherProfile.email);

    if (!user) {
      throw new Error(`Teacher user not found for ${teacherProfile.email}`);
    }

    const teacher = await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {
        employeeCode: teacherProfile.employeeCode,
        phone: teacherProfile.phone,
      },
      create: {
        userId: user.id,
        employeeCode: teacherProfile.employeeCode,
        phone: teacherProfile.phone,
      },
    });

    teacherByEmail.set(teacherProfile.email, { id: teacher.id });
  }

  const courseByKey = new Map<string, { id: number }>();

  for (const courseData of coursesToSeed) {
    const teacher = teacherByEmail.get(courseData.homeroomTeacherEmail);

    if (!teacher) {
      throw new Error(`Homeroom teacher not found for ${courseData.name}`);
    }

    const course = await prisma.course.upsert({
      where: {
        schoolYearId_level_letter: {
          schoolYearId: schoolYear.id,
          level: courseData.level,
          letter: courseData.letter,
        },
      },
      update: {
        name: courseData.name,
        homeroomTeacherId: teacher.id,
      },
      create: {
        name: courseData.name,
        level: courseData.level,
        letter: courseData.letter,
        schoolYearId: schoolYear.id,
        homeroomTeacherId: teacher.id,
      },
    });

    courseByKey.set(toCourseKey(courseData.level, courseData.letter), {
      id: course.id,
    });
  }

  const subjectByCode = new Map<string, { id: number }>();

  for (const subjectData of subjectsToSeed) {
    const subject = await prisma.subject.upsert({
      where: { code: subjectData.code },
      update: {
        name: subjectData.name,
        description: subjectData.description,
      },
      create: {
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description,
      },
    });

    subjectByCode.set(subject.code, { id: subject.id });
  }

  const courseSubjectByKey = new Map<string, { id: number }>();

  for (const csData of courseSubjectsToSeed) {
    const course = courseByKey.get(toCourseKey(csData.courseLevel, csData.courseLetter));
    const subject = subjectByCode.get(csData.subjectCode);
    const teacher = teacherByEmail.get(csData.teacherEmail);

    if (!course || !subject || !teacher) {
      throw new Error(`Invalid course-subject seed data for ${csData.subjectCode}`);
    }

    const courseSubject = await prisma.courseSubject.upsert({
      where: {
        courseId_subjectId: {
          courseId: course.id,
          subjectId: subject.id,
        },
      },
      update: {
        teacherId: teacher.id,
      },
      create: {
        courseId: course.id,
        subjectId: subject.id,
        teacherId: teacher.id,
      },
    });

    courseSubjectByKey.set(
      toCourseSubjectKey(csData.courseLevel, csData.courseLetter, csData.subjectCode),
      { id: courseSubject.id },
    );
  }

  return { schoolYear, courseByKey, teacherByEmail, subjectByCode, courseSubjectByKey };
}

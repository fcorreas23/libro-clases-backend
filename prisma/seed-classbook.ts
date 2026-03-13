import { prisma } from './seed-client.js';
import {
  annotationsToSeed,
  gradesToSeed,
  toCourseKey,
  toCourseSubjectKey,
} from './seed-data.js';

type LookupMap = Map<string, { id: number }>;

type SeedClassbookInput = {
  schoolYearId: number;
  courseByKey: LookupMap;
  courseSubjectByKey: LookupMap;
  teacherByEmail: LookupMap;
  studentByCode: LookupMap;
  subjectByCode: LookupMap;
};

export async function seedClassbookRecords({
  schoolYearId,
  courseByKey,
  courseSubjectByKey,
  teacherByEmail,
  studentByCode,
  subjectByCode,
}: SeedClassbookInput) {
  for (const gradeData of gradesToSeed) {
    const student = studentByCode.get(gradeData.studentCode);
    const course = courseByKey.get(toCourseKey(gradeData.courseLevel, gradeData.courseLetter));
    const subject = subjectByCode.get(gradeData.subjectCode);
    const teacher = teacherByEmail.get(gradeData.teacherEmail);
    const courseSubject = courseSubjectByKey.get(
      toCourseSubjectKey(gradeData.courseLevel, gradeData.courseLetter, gradeData.subjectCode),
    );

    if (!student || !course || !subject || !teacher || !courseSubject) {
      throw new Error(`Invalid grade seed data for ${gradeData.studentCode} - ${gradeData.title}`);
    }

    const existingGrade = await prisma.grade.findFirst({
      where: {
        studentId: student.id,
        courseId: course.id,
        schoolYearId,
        subjectId: subject.id,
        title: gradeData.title,
      },
      select: { id: true },
    });

    if (existingGrade) {
      await prisma.grade.update({
        where: { id: existingGrade.id },
        data: {
          teacherId: teacher.id,
          courseSubjectId: courseSubject.id,
          value: gradeData.value,
        },
      });
      continue;
    }

    await prisma.grade.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        schoolYearId,
        subjectId: subject.id,
        courseSubjectId: courseSubject.id,
        teacherId: teacher.id,
        title: gradeData.title,
        value: gradeData.value,
      },
    });
  }

  for (const annotationData of annotationsToSeed) {
    const student = studentByCode.get(annotationData.studentCode);
    const course = courseByKey.get(
      toCourseKey(annotationData.courseLevel, annotationData.courseLetter),
    );
    const teacher = teacherByEmail.get(annotationData.teacherEmail);

    if (!student || !course || !teacher) {
      throw new Error(`Invalid annotation seed data for ${annotationData.studentCode}`);
    }

    const existingAnnotation = await prisma.annotation.findFirst({
      where: {
        studentId: student.id,
        courseId: course.id,
        schoolYearId,
        teacherId: teacher.id,
        type: annotationData.type,
        content: annotationData.content,
      },
      select: { id: true },
    });

    if (!existingAnnotation) {
      await prisma.annotation.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          schoolYearId,
          teacherId: teacher.id,
          type: annotationData.type,
          content: annotationData.content,
        },
      });
    }
  }
}

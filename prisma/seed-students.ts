import { prisma } from './seed-client.js';
import { studentsToSeed, toCourseKey } from './seed-data.js';

export async function seedStudentsAndEnrollments(
  schoolYearId: number,
  courseByKey: Map<string, { id: number }>,
) {
  const studentByCode = new Map<string, { id: number }>();

  for (const studentData of studentsToSeed) {
    const courseKey = toCourseKey(studentData.courseLevel, studentData.courseLetter);
    const course = courseByKey.get(courseKey);

    if (!course) {
      throw new Error(`Course not found for key ${courseKey}`);
    }

    const student = await prisma.student.upsert({
      where: { studentCode: studentData.studentCode },
      update: {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        birthDate: studentData.birthDate,
        rut: studentData.rut,
        email: studentData.email,
        phone: studentData.phone,
        address: studentData.address,
        isActive: true,
      },
      create: {
        studentCode: studentData.studentCode,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        birthDate: studentData.birthDate,
        rut: studentData.rut,
        email: studentData.email,
        phone: studentData.phone,
        address: studentData.address,
        isActive: true,
      },
    });

    await prisma.enrollment.upsert({
      where: {
        studentId_schoolYearId: {
          studentId: student.id,
          schoolYearId,
        },
      },
      update: {
        courseId: course.id,
        status: 'active',
      },
      create: {
        studentId: student.id,
        courseId: course.id,
        schoolYearId,
        status: 'active',
      },
    });

    studentByCode.set(studentData.studentCode, { id: student.id });
  }

  return { studentByCode };
}

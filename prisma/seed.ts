import { defaultPassword, prisma } from './seed-client.js';
import { studentsToSeed } from './seed-data.js';
import { seedSchoolStructure } from './seed-academic.js';
import { seedAttendanceWeek } from './seed-attendance.js';
import { seedClassbookRecords } from './seed-classbook.js';
import { seedStudentsAndEnrollments } from './seed-students.js';
import { seedRoles, seedUsers } from './seed-users.js';

async function main() {
  const roleByName = await seedRoles();
  const users = await seedUsers(roleByName);

  const { schoolYear, courseByKey, teacherByEmail, subjectByCode, courseSubjectByKey } =
    await seedSchoolStructure(users);
  const { studentByCode } = await seedStudentsAndEnrollments(schoolYear.id, courseByKey);
  await seedClassbookRecords({
    schoolYearId: schoolYear.id,
    courseByKey,
    courseSubjectByKey,
    teacherByEmail,
    studentByCode,
    subjectByCode,
  });
  const attendanceSummary = await seedAttendanceWeek({
    schoolYearId: schoolYear.id,
    courseByKey,
    studentByCode,
    teacherByEmail,
  });

  console.log('Seed completado');
  console.log(`Password por defecto: ${defaultPassword}`);
  console.log('Admin: admin@colegio.cl');
  console.log('Cursos creados: 1B-A, 2B-A, 3B-A');
  console.log(`Alumnos creados: ${studentsToSeed.length}`);
  console.log('Asignaturas creadas: MAT, LEN, CIE');
  console.log('Notas y anotaciones de ejemplo creadas');
  console.log(
    `Asistencia de ejemplo creada: ${attendanceSummary.studentsSeeded} alumnos x ${attendanceSummary.daysSeeded} dias`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Error ejecutando seed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
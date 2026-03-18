import { AnnotationType } from '@prisma/client';

export const usersToSeed = [
  {
    email: 'admin@colegio.cl',
    firstName: 'Administrador',
    lastName: 'General',
    role: 'admin',
  },
  {
    email: 'director@colegio.cl',
    firstName: 'Daniela',
    lastName: 'Rojas',
    role: 'director',
  },
  {
    email: 'utp@colegio.cl',
    firstName: 'Marcela',
    lastName: 'Soto',
    role: 'utp',
  },
  {
    email: 'inspector@colegio.cl',
    firstName: 'Patricio',
    lastName: 'Munoz',
    role: 'inspector',
  },
  {
    email: 'profesor.jefe@colegio.cl',
    firstName: 'Carolina',
    lastName: 'Perez',
    role: 'teacher',
  },
  {
    email: 'profesor.lenguaje@colegio.cl',
    firstName: 'Rocio',
    lastName: 'Vidal',
    role: 'teacher',
  },
  {
    email: 'profesor.matematica@colegio.cl',
    firstName: 'Diego',
    lastName: 'Carrasco',
    role: 'teacher',
  },
] as const;

export const teacherProfiles = [
  {
    email: 'profesor.jefe@colegio.cl',
    employeeCode: 'DOC-2026-001',
    phone: '+56944444444',
  },
  {
    email: 'profesor.lenguaje@colegio.cl',
    employeeCode: 'DOC-2026-002',
    phone: '+56955555555',
  },
  {
    email: 'profesor.matematica@colegio.cl',
    employeeCode: 'DOC-2026-003',
    phone: '+56966666666',
  },
] as const;

export const coursesToSeed = [
  { name: '1ro Básico A', level: '1', letter: 'A', homeroomTeacherEmail: 'profesor.jefe@colegio.cl' },
  { name: '2do Básico A', level: '2', letter: 'A', homeroomTeacherEmail: 'profesor.lenguaje@colegio.cl' },
  { name: '3ro Básico A', level: '3', letter: 'A', homeroomTeacherEmail: 'profesor.matematica@colegio.cl' },
  { name: '4to Básico A', level: '4', letter: 'A', homeroomTeacherEmail: 'profesor.jefe@colegio.cl' },
  { name: '5to Básico A', level: '5', letter: 'A', homeroomTeacherEmail: 'profesor.jefe@colegio.cl' },
  { name: '6to Básico A', level: '6', letter: 'A', homeroomTeacherEmail: 'profesor.jefe@colegio.cl' },
  { name: '7mo Básico A', level: '7', letter: 'A', homeroomTeacherEmail: 'profesor.jefe@colegio.cl' },
  { name: '8vo Básico A', level: '8', letter: 'A', homeroomTeacherEmail: 'profesor.jefe@colegio.cl' },
] as const;

export const studentsToSeed = [
  {
    studentCode: 'STU-2026-001',
    firstName: 'Isidora',
    lastName: 'Gonzalez',
    birthDate: new Date('2015-04-12'),
    rut: '23.456.789-1',
    email: 'isidora.gonzalez@alumnos.colegio.cl',
    phone: '+56911111111',
    address: 'Av. Los Alerces 123',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-002',
    firstName: 'Mateo',
    lastName: 'Fernandez',
    birthDate: new Date('2015-08-23'),
    rut: '23.456.789-2',
    email: 'mateo.fernandez@alumnos.colegio.cl',
    phone: '+56922222222',
    address: 'Pasaje El Roble 456',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-003',
    firstName: 'Florencia',
    lastName: 'Castillo',
    birthDate: new Date('2014-11-05'),
    rut: '23.456.789-3',
    email: 'florencia.castillo@alumnos.colegio.cl',
    phone: '+56933333333',
    address: 'Calle Los Copihues 789',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-004',
    firstName: 'Benjamin',
    lastName: 'Navarro',
    birthDate: new Date('2015-03-19'),
    rut: '23.456.789-4',
    email: 'benjamin.navarro@alumnos.colegio.cl',
    phone: '+56944441111',
    address: 'Calle O Higgins 112',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-005',
    firstName: 'Vicente',
    lastName: 'Araya',
    birthDate: new Date('2014-04-17'),
    rut: '23.456.789-5',
    email: 'vicente.araya@alumnos.colegio.cl',
    phone: '+56911112222',
    address: 'Av. Libertad 220',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-006',
    firstName: 'Martina',
    lastName: 'Pino',
    birthDate: new Date('2014-01-30'),
    rut: '23.456.789-6',
    email: 'martina.pino@alumnos.colegio.cl',
    phone: '+56922223333',
    address: 'Pasaje Quillota 18',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-007',
    firstName: 'Agustin',
    lastName: 'Leiva',
    birthDate: new Date('2014-07-10'),
    rut: '23.456.789-7',
    email: 'agustin.leiva@alumnos.colegio.cl',
    phone: '+56933334444',
    address: 'Calle Los Notros 778',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-008',
    firstName: 'Antonia',
    lastName: 'Sepulveda',
    birthDate: new Date('2014-09-09'),
    rut: '23.456.789-8',
    email: 'antonia.sepulveda@alumnos.colegio.cl',
    phone: '+56944445555',
    address: 'Av. Cuarta 995',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-009',
    firstName: 'Joaquin',
    lastName: 'Sanhueza',
    birthDate: new Date('2013-06-12'),
    rut: '23.456.789-9',
    email: 'joaquin.sanhueza@alumnos.colegio.cl',
    phone: '+56955556666',
    address: 'Calle Norte 330',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-010',
    firstName: 'Renata',
    lastName: 'Molina',
    birthDate: new Date('2013-02-22'),
    rut: '23.456.789-K',
    email: 'renata.molina@alumnos.colegio.cl',
    phone: '+56966667777',
    address: 'Pasaje Las Rosas 901',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-011',
    firstName: 'Alonso',
    lastName: 'Mardones',
    birthDate: new Date('2013-12-03'),
    rut: '23.456.790-0',
    email: 'alonso.mardones@alumnos.colegio.cl',
    phone: '+56977778888',
    address: 'Calle Sur 442',
    courseLevel: '1',
    courseLetter: 'A',
  },
  {
    studentCode: 'STU-2026-012',
    firstName: 'Emilia',
    lastName: 'Lagos',
    birthDate: new Date('2013-10-25'),
    rut: '23.456.790-1',
    email: 'emilia.lagos@alumnos.colegio.cl',
    phone: '+56988889999',
    address: 'Av. Principal 1500',
    courseLevel: '1',
    courseLetter: 'A',
  },
] as const;

export const subjectsToSeed = [
  {
    name: 'Matematicas',
    code: 'MAT',
    description: 'Resolucion de problemas y pensamiento numerico',
  },
  {
    name: 'Lenguaje',
    code: 'LEN',
    description: 'Comprension lectora y comunicacion escrita',
  },
  {
    name: 'Ciencias Naturales',
    code: 'CIE',
    description: 'Exploracion del mundo natural',
  },
  {
    name: 'Historia, Geografía y Ciencias Sociales',
    code: 'HIS',
    description: 'Estudio del pasado, sociedad y espacio geografico',
  },
  { name: 'Inglés', code: 'ING', description: 'Aprendizaje del idioma ingles' },
  { name: 'Educación Física y Salud', code: 'EF', description: 'Actividad fisica y salud' },
  { name: 'Artes Visuales', code: 'ART', description: 'Expresion artistica y visual' },
  { name: 'Música', code: 'MUS', description: 'Educacion musical y auditiva' },
  { name: 'Tecnología', code: 'TEC', description: 'TIC y herramientas tecnicas' },
  { name: 'Orientación', code: 'ORI', description: 'Orientacion y apoyo psicopedagogico' },
  { name: 'Religión', code: 'REL', description: 'Formacion religiosa y valores' },
] as const;

export const courseSubjectsToSeed = [
  { courseLevel: '1', courseLetter: 'A', subjectCode: 'MAT', teacherEmail: 'profesor.matematica@colegio.cl' },
  { courseLevel: '1', courseLetter: 'A', subjectCode: 'LEN', teacherEmail: 'profesor.lenguaje@colegio.cl' },
  { courseLevel: '1', courseLetter: 'A', subjectCode: 'CIE', teacherEmail: 'profesor.jefe@colegio.cl' },
  { courseLevel: '1', courseLetter: 'A', subjectCode: 'HIS', teacherEmail: 'profesor.jefe@colegio.cl' },
  { courseLevel: '2', courseLetter: 'A', subjectCode: 'MAT', teacherEmail: 'profesor.matematica@colegio.cl' },
  { courseLevel: '2', courseLetter: 'A', subjectCode: 'LEN', teacherEmail: 'profesor.lenguaje@colegio.cl' },
  { courseLevel: '2', courseLetter: 'A', subjectCode: 'CIE', teacherEmail: 'profesor.jefe@colegio.cl' },
  { courseLevel: '3', courseLetter: 'A', subjectCode: 'MAT', teacherEmail: 'profesor.matematica@colegio.cl' },
  { courseLevel: '3', courseLetter: 'A', subjectCode: 'LEN', teacherEmail: 'profesor.lenguaje@colegio.cl' },
  { courseLevel: '3', courseLetter: 'A', subjectCode: 'CIE', teacherEmail: 'profesor.jefe@colegio.cl' },
] as const;

export const gradesToSeed = [
  { studentCode: 'STU-2026-001', courseLevel: '1', courseLetter: 'A', subjectCode: 'MAT', teacherEmail: 'profesor.matematica@colegio.cl', title: 'Prueba Diagnostica 1', value: 6.2 },
  { studentCode: 'STU-2026-002', courseLevel: '1', courseLetter: 'A', subjectCode: 'LEN', teacherEmail: 'profesor.lenguaje@colegio.cl', title: 'Control Comprension Lectora', value: 5.8 },
  { studentCode: 'STU-2026-006', courseLevel: '2', courseLetter: 'A', subjectCode: 'MAT', teacherEmail: 'profesor.matematica@colegio.cl', title: 'Ejercicios Operatoria', value: 6.5 },
  { studentCode: 'STU-2026-009', courseLevel: '3', courseLetter: 'A', subjectCode: 'CIE', teacherEmail: 'profesor.jefe@colegio.cl', title: 'Laboratorio Plantas', value: 5.9 },
] as const;

export const annotationsToSeed = [
  { studentCode: 'STU-2026-001', courseLevel: '1', courseLetter: 'A', teacherEmail: 'profesor.jefe@colegio.cl', type: AnnotationType.positive, content: 'Participa activamente y apoya a sus companeros en clases.' },
  { studentCode: 'STU-2026-007', courseLevel: '2', courseLetter: 'A', teacherEmail: 'profesor.lenguaje@colegio.cl', type: AnnotationType.negative, content: 'Interrumpe durante la clase y no respeta turnos de palabra.' },
  { studentCode: 'STU-2026-010', courseLevel: '3', courseLetter: 'A', teacherEmail: 'profesor.matematica@colegio.cl', type: AnnotationType.positive, content: 'Mejoro su desempeno y entrega tareas a tiempo.' },
] as const;

export type SeededUser = (typeof usersToSeed)[number] & { id: number };

export function toCourseKey(level: string, letter: string) {
  // Produce compact course code like '1A'
  return `${level}${letter}`;
}

export function toCourseSubjectKey(level: string, letter: string, subjectCode: string) {
  // Produce keys like '1A-MAT'
  return `${level}${letter}-${subjectCode}`;
}

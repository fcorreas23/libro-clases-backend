import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnotationsController } from './annotations/annotations.controller';
import { AnnotationsService } from './annotations/annotations.service';
import { AttendancesController } from './attendances/attendances.controller';
import { AttendancesService } from './attendances/attendances.service';
import { CourseSubjectsController } from './course-subjects/course-subjects.controller';
import { CourseSubjectsService } from './course-subjects/course-subjects.service';
import { CoursesController } from './courses/courses.controller';
import { CoursesService } from './courses/courses.service';
import { EnrollmentsController } from './enrollments/enrollments.controller';
import { EnrollmentsService } from './enrollments/enrollments.service';
import { GradesController } from './grades/grades.controller';
import { GradesService } from './grades/grades.service';
import { PrismaModule } from './prisma/prisma.module';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { SchoolYearsController } from './school-years/school-years.controller';
import { SchoolYearsService } from './school-years/school-years.service';
import { StudentsController } from './students/students.controller';
import { StudentsService } from './students/students.service';
import { SubjectsController } from './subjects/subjects.controller';
import { SubjectsService } from './subjects/subjects.service';
import { TeachersController } from './teachers/teachers.controller';
import { TeachersService } from './teachers/teachers.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AppController,
    UsersController,
    SchoolYearsController,
    CoursesController,
    StudentsController,
    EnrollmentsController,
    RolesController,
    TeachersController,
    SubjectsController,
    CourseSubjectsController,
    GradesController,
    AnnotationsController,
    AttendancesController,
  ],
  providers: [
    AppService,
    UsersService,
    SchoolYearsService,
    CoursesService,
    StudentsService,
    EnrollmentsService,
    RolesService,
    TeachersService,
    SubjectsService,
    CourseSubjectsService,
    GradesService,
    AnnotationsService,
    AttendancesService,
  ],
})
export class AppModule {}

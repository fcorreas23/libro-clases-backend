import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
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
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'libro-clases-dev-secret',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [
    AppController,
    AuthController,
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
    AuthService,
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
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

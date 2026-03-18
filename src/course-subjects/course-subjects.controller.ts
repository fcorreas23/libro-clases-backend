import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CourseSubjectsQueryDto } from './dto/course-subjects-query.dto';
import { CreateCourseSubjectDto } from './dto/create-course-subject.dto';
import { UpdateCourseSubjectDto } from './dto/update-course-subject.dto';
import { CourseSubjectsService } from './course-subjects.service';
import { Roles } from '../auth/roles.decorator';

@Controller('course-subjects')
export class CourseSubjectsController {
  constructor(private readonly courseSubjectsService: CourseSubjectsService) {}

  @Roles('admin')
  @Post()
  create(@Body() data: CreateCourseSubjectDto) {
    return this.courseSubjectsService.create(data);
  }

  @Roles('admin', 'teacher', 'utp')
  @Get()
  findAll(@Query() query: CourseSubjectsQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.courseSubjectsService.findAll(query, user);
  }

  @Roles('admin', 'teacher', 'utp')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.courseSubjectsService.findOne(id, user);
  }

  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCourseSubjectDto,
  ) {
    return this.courseSubjectsService.update(id, data);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseSubjectsService.remove(id);
  }
}

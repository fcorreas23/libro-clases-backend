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
import { CourseSubjectsQueryDto } from './dto/course-subjects-query.dto';
import { CreateCourseSubjectDto } from './dto/create-course-subject.dto';
import { UpdateCourseSubjectDto } from './dto/update-course-subject.dto';
import { CourseSubjectsService } from './course-subjects.service';

@Controller('course-subjects')
export class CourseSubjectsController {
  constructor(private readonly courseSubjectsService: CourseSubjectsService) {}

  @Post()
  create(@Body() data: CreateCourseSubjectDto) {
    return this.courseSubjectsService.create(data);
  }

  @Get()
  findAll(@Query() query: CourseSubjectsQueryDto) {
    return this.courseSubjectsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseSubjectsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCourseSubjectDto,
  ) {
    return this.courseSubjectsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseSubjectsService.remove(id);
  }
}

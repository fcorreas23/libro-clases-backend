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
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentsQueryDto } from './dto/students-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';
import { Roles } from '../auth/roles.decorator';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Roles('admin', 'inspector')
  @Post()
  create(@Body() data: CreateStudentDto) {
    return this.studentsService.create(data);
  }

  @Roles('admin', 'inspector')
  @Get('next-code')
  nextCode() {
    return this.studentsService.generateCode();
  }

  @Roles('admin', 'teacher', 'utp', 'inspector')
  @Get()
  findAll(
    @Query() query: StudentsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.studentsService.findAll(query, user);
  }

  @Roles('admin', 'teacher', 'utp', 'inspector')
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.studentsService.findOne(id, user);
  }

  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, data);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}

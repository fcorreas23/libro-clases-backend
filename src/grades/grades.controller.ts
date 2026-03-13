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
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateGradeDto } from './dto/create-grade.dto';
import { GradesQueryDto } from './dto/grades-query.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradesService } from './grades.service';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Roles('admin', 'teacher')
  @Post()
  create(@Body() data: CreateGradeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.gradesService.create(data, user);
  }

  @Roles('admin', 'teacher')
  @Get()
  findAll(@Query() query: GradesQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.gradesService.findAll(query, user);
  }

  @Roles('admin', 'teacher')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.gradesService.findOne(id, user);
  }

  @Roles('admin', 'teacher')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateGradeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.gradesService.update(id, data, user);
  }

  @Roles('admin', 'teacher')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.gradesService.remove(id, user);
  }
}

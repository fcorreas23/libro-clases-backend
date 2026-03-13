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
import { CreateSubjectDto } from './dto/create-subject.dto';
import { SubjectsQueryDto } from './dto/subjects-query.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';
import { Roles } from '../auth/roles.decorator';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Roles('admin')
  @Post()
  create(@Body() data: CreateSubjectDto) {
    return this.subjectsService.create(data);
  }

  @Roles('admin', 'teacher')
  @Get()
  findAll(@Query() query: SubjectsQueryDto) {
    return this.subjectsService.findAll(query);
  }

  @Roles('admin', 'teacher')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(id, data);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subjectsService.remove(id);
  }
}

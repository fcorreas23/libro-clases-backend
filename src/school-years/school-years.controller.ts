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
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { SchoolYearsQueryDto } from './dto/school-years-query.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { SchoolYearsService } from './school-years.service';
import { Roles } from '../auth/roles.decorator';

@Controller('school-years')
export class SchoolYearsController {
  constructor(private readonly schoolYearsService: SchoolYearsService) {}

  @Roles('admin')
  @Post()
  create(@Body() data: CreateSchoolYearDto) {
    return this.schoolYearsService.create(data);
  }

  @Roles('admin', 'utp')
  @Get()
  findAll(@Query() query: SchoolYearsQueryDto) {
    return this.schoolYearsService.findAll(query);
  }

  @Roles('admin', 'utp')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.schoolYearsService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateSchoolYearDto,
  ) {
    return this.schoolYearsService.update(id, data);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schoolYearsService.remove(id);
  }
}

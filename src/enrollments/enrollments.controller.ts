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
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentsService } from './enrollments.service';
import { Roles } from '../auth/roles.decorator';

@Roles('admin')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  create(@Body() data: CreateEnrollmentDto) {
    return this.enrollmentsService.create(data);
  }

  @Get()
  @Roles('admin', 'utp')
  findAll(@Query() query: EnrollmentsQueryDto) {
    return this.enrollmentsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'utp')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateEnrollmentDto,
  ) {
    return this.enrollmentsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}

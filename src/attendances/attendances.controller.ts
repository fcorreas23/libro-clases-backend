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
import { AttendancesService } from './attendances.service';
import { AttendanceDailySummaryQueryDto } from './dto/attendance-daily-summary-query.dto';
import { AttendanceRangeSummaryQueryDto } from './dto/attendance-range-summary-query.dto';
import { AttendancesQueryDto } from './dto/attendances-query.dto';
import { BulkUpsertAttendanceDto } from './dto/bulk-upsert-attendance.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Roles('admin', 'teacher')
  @Post()
  create(
    @Body() data: CreateAttendanceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attendancesService.create(data, user);
  }

  @Roles('admin', 'teacher')
  @Post('bulk')
  bulkUpsert(
    @Body() data: BulkUpsertAttendanceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attendancesService.bulkUpsert(data, user);
  }

  @Roles('admin', 'teacher', 'utp')
  @Get()
  findAll(
    @Query() query: AttendancesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attendancesService.findAll(query, user);
  }

  @Roles('admin', 'teacher', 'utp')
  @Get('daily-summary')
  dailySummary(
    @Query() query: AttendanceDailySummaryQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attendancesService.getDailySummary(query, user);
  }

  @Roles('admin', 'teacher', 'utp')
  @Get('daily-summary/range')
  dailySummaryRange(
    @Query() query: AttendanceRangeSummaryQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attendancesService.getDailySummaryRange(query, user);
  }

  @Roles('admin', 'teacher', 'utp')
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attendancesService.findOne(id, user);
  }

  @Roles('admin', 'teacher')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAttendanceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attendancesService.update(id, data, user);
  }

  @Roles('admin', 'teacher')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.attendancesService.remove(id, user);
  }
}

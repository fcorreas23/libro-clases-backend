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

  @Post()
  create(@Body() data: CreateAttendanceDto) {
    return this.attendancesService.create(data);
  }

  @Post('bulk')
  bulkUpsert(@Body() data: BulkUpsertAttendanceDto) {
    return this.attendancesService.bulkUpsert(data);
  }

  @Get()
  findAll(@Query() query: AttendancesQueryDto) {
    return this.attendancesService.findAll(query);
  }

  @Get('daily-summary')
  dailySummary(@Query() query: AttendanceDailySummaryQueryDto) {
    return this.attendancesService.getDailySummary(query);
  }

  @Get('daily-summary/range')
  dailySummaryRange(@Query() query: AttendanceRangeSummaryQueryDto) {
    return this.attendancesService.getDailySummaryRange(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendancesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateAttendanceDto) {
    return this.attendancesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendancesService.remove(id);
  }
}

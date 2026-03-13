import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

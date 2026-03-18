import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class CreateAttendanceDto {
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsInt()
  @Min(1)
  courseId!: number;

  @IsInt()
  @Min(1)
  schoolYearId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  takenByTeacherId?: number | null;

  @IsDateString()
  date!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

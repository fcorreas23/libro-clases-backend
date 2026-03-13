import { Type } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class AttendanceDailySummaryQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  schoolYearId!: number;

  @IsDateString()
  date!: string;
}

import { Type } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class AttendanceRangeSummaryQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  schoolYearId!: number;

  @IsDateString()
  dateFrom!: string;

  @IsDateString()
  dateTo!: string;
}

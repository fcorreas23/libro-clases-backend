import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  studentId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  courseId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  schoolYearId?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

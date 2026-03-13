import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateEnrollmentDto {
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
  @IsString()
  status?: string;
}

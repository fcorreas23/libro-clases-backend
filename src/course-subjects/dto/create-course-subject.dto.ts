import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateCourseSubjectDto {
  @IsInt()
  @Min(1)
  courseId!: number;

  @IsInt()
  @Min(1)
  subjectId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  teacherId?: number | null;
}

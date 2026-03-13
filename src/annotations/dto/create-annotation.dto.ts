import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { AnnotationType } from '@prisma/client';

export class CreateAnnotationDto {
  @IsInt()
  @Min(1)
  studentId!: number;

  @IsInt()
  @Min(1)
  courseId!: number;

  @IsInt()
  @Min(1)
  schoolYearId!: number;

  @IsInt()
  @Min(1)
  teacherId!: number;

  @IsEnum(AnnotationType)
  type!: AnnotationType;

  @IsString()
  @MinLength(3)
  content!: string;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}

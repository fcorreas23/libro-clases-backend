import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGradeDto {
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
  subjectId!: number;

  @IsInt()
  @Min(1)
  courseSubjectId!: number;

  @IsInt()
  @Min(1)
  teacherId!: number;

  @IsString()
  @MinLength(2)
  title!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(7)
  value!: number;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}

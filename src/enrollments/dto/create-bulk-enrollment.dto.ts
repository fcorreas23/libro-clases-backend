import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBulkEnrollmentDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  studentIds!: number[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  schoolYearId!: number;

  @IsOptional()
  @IsString()
  status?: string;
}

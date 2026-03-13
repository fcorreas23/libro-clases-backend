import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { AnnotationType } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AnnotationsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  studentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  schoolYearId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  teacherId?: number;

  @IsOptional()
  @IsEnum(AnnotationType)
  type?: AnnotationType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeNegative?: boolean;

  @IsOptional()
  @IsIn(['admin', 'director', 'utp', 'teacher', 'inspector'])
  viewerRole?: string;
}

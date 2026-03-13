import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AnnotationType } from '../../../generated/prisma/enums.js';

export class UpdateAnnotationDto {
  @IsOptional()
  @IsEnum(AnnotationType)
  type?: AnnotationType;

  @IsOptional()
  @IsString()
  @MinLength(3)
  content?: string;

  @IsOptional()
  @IsDateString()
  recordedAt?: string;
}

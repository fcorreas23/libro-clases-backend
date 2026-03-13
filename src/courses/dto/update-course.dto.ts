import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  level?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  letter?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  schoolYearId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  homeroomTeacherId?: number | null;
}

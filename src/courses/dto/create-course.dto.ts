import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(1)
  level!: string;

  @IsString()
  @MinLength(1)
  letter!: string;

  @IsInt()
  @Min(1)
  schoolYearId!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  homeroomTeacherId?: number | null;
}

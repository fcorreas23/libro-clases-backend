import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateTeacherDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  employeeCode?: string;

  @IsOptional()
  @IsString()
  phone?: string | null;
}

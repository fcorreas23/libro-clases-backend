import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsString()
  @MinLength(3)
  employeeCode!: string;

  @IsOptional()
  @IsString()
  phone?: string | null;
}

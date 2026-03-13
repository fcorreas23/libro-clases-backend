import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTeacherAccountDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsString()
  @MinLength(3)
  employeeCode!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

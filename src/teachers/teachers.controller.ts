import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateTeacherAccountDto } from './dto/create-teacher-account.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeachersQueryDto } from './dto/teachers-query.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Roles('admin')
  @Post('accounts')
  createAccount(@Body() data: CreateTeacherAccountDto) {
    return this.teachersService.createAccount(data);
  }

  @Roles('admin')
  @Post()
  create(@Body() data: CreateTeacherDto) {
    return this.teachersService.create(data);
  }

  @Roles('admin')
  @Get()
  findAll(@Query() query: TeachersQueryDto) {
    return this.teachersService.findAll(query);
  }

  @Roles('admin', 'teacher')
  @Get('me')
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.teachersService.findByUserId(user.sub);
  }

  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, data);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.remove(id);
  }
}

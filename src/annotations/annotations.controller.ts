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
import { AnnotationsQueryDto } from './dto/annotations-query.dto';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';
import { AnnotationsService } from './annotations.service';

@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Roles('admin', 'teacher')
  @Post()
  create(
    @Body() data: CreateAnnotationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.annotationsService.create(data, user);
  }

  @Roles('admin', 'teacher', 'utp')
  @Get()
  findAll(
    @Query() query: AnnotationsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.annotationsService.findAll(query, user);
  }

  @Roles('admin', 'teacher', 'utp')
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
    @Query('viewerRole') viewerRole?: string,
  ) {
    return this.annotationsService.findOne(id, user, viewerRole);
  }

  @Roles('admin', 'teacher')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAnnotationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.annotationsService.update(id, data, user);
  }

  @Roles('admin', 'teacher')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.annotationsService.remove(id, user);
  }
}

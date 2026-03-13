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
import { AnnotationsQueryDto } from './dto/annotations-query.dto';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';
import { AnnotationsService } from './annotations.service';

@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Post()
  create(@Body() data: CreateAnnotationDto) {
    return this.annotationsService.create(data);
  }

  @Get()
  findAll(@Query() query: AnnotationsQueryDto) {
    return this.annotationsService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('viewerRole') viewerRole?: string,
  ) {
    return this.annotationsService.findOne(id, viewerRole);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAnnotationDto,
  ) {
    return this.annotationsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.annotationsService.remove(id);
  }
}

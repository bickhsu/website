import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KeyframeService } from './keyframe.service';
import { CreateKeyframeDto } from './dto/create-keyframe.dto';
import { UpdateKeyframeDto } from './dto/update-keyframe.dto';

@Controller('keyframe')
export class KeyframeController {
  constructor(private readonly keyframeService: KeyframeService) {}

  @Post()
  create(@Body() createKeyframeDto: CreateKeyframeDto) {
    return this.keyframeService.create(createKeyframeDto);
  }

  @Post(':id/frames')
  async addFrame(@Param('id') id: string, @Body('content') content: string) {
    return this.keyframeService.addFrame(id, content);
  }

  @Get()
  findAll() {
    return this.keyframeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.keyframeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKeyframeDto: UpdateKeyframeDto) {
    return this.keyframeService.update(id, updateKeyframeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.keyframeService.remove(id);
  }
}

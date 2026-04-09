import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FrameService } from './frame.service';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';

@Controller('frame')
export class FrameController {
  constructor(private readonly frameService: FrameService) {}

  @Post()
  create(@Body() createFrameDto: CreateFrameDto) {
    return this.frameService.create(createFrameDto);
  }

  @Get()
  findAll() {
    return this.frameService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.frameService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFrameDto: UpdateFrameDto) {
    return this.frameService.update(+id, updateFrameDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.frameService.remove(+id);
  }
}

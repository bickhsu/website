import { Controller, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { FrameService } from './frame.service';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';

@Controller('frame')
export class FrameController {
  constructor(private readonly frameService: FrameService) { }

  @Post()
  create(@Body() createFrameDto: CreateFrameDto) {
    return this.frameService.create(createFrameDto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateFrameDto: UpdateFrameDto) {
    return this.frameService.update(id, updateFrameDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.frameService.remove(id);
  }
}

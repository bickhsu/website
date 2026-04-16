import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SequenceService } from './sequence.service';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { UpdateSequenceDto } from './dto/update-sequence.dto';

@Controller('sequence')
export class SequenceController {
  constructor(private readonly sequenceService: SequenceService) { }

  @Post()
  async create(@Body() createSequenceDto: CreateSequenceDto) {
    return this.sequenceService.create(createSequenceDto);
  }

  @Get()
  async findAll() {
    return this.sequenceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sequenceService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSequenceDto: UpdateSequenceDto) {
    return this.sequenceService.update(id, updateSequenceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sequenceService.remove(id);
  }
}

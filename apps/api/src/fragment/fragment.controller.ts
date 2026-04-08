import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FragmentService } from './fragment.service';
import { CreateFragmentDto } from './dto/create-fragment.dto';
import { UpdateFragmentDto } from './dto/update-fragment.dto';

@Controller('fragment')
export class FragmentController {
  constructor(private readonly fragmentService: FragmentService) {}

  @Post()
  create(@Body() createFragmentDto: CreateFragmentDto) {
    return this.fragmentService.create(createFragmentDto);
  }

  @Get()
  findAll() {
    return this.fragmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fragmentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFragmentDto: UpdateFragmentDto) {
    return this.fragmentService.update(+id, updateFragmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fragmentService.remove(+id);
  }
}

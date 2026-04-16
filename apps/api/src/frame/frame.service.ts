import { Injectable } from '@nestjs/common';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FrameService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createFrameDto: CreateFrameDto) {
    return this.prisma.frame.create({
      data: createFrameDto,
    });
  }

  async update(id: string, updateFrameDto: UpdateFrameDto) {
    return this.prisma.frame.update({
      where: { id },
      data: updateFrameDto,
    });
  }

  async remove(id: string) {
    const { count } = await this.prisma.frame.deleteMany({
      where: { id },
    });

    return {
      id,
      deleted: count > 0,
      message: count > 0 ? 'Deleted successfully' : 'Already non-existent',
    };
  }
}

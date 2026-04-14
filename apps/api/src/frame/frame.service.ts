import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FrameService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createFrameDto: CreateFrameDto) {
    try {
      return await this.prisma.frame.create({
        data: createFrameDto,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create the frame.');
    }
  }

  async update(id: string, updateFrameDto: UpdateFrameDto) {
    try {
      return await this.prisma.frame.update({
        where: { id },
        data: updateFrameDto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Frame with ID ${id} not found`);
      }
      throw new InternalServerErrorException('Failed to update the frame.');
    }
  }

  async remove(id: string) {
    try {
      const { count } = await this.prisma.frame.deleteMany({
        where: { id },
      });
      return {
        id,
        deleted: count > 0,
        message: count > 0 ? 'Deleted successfully' : 'Already non-existent',
      }
    } catch (error) {
      throw new InternalServerErrorException('Database execution failed.');
    }
  }
}

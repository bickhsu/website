import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateFrameDto } from './dto/create-frame.dto';
import { UpdateFrameDto } from './dto/update-frame.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FrameService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createFrameDto: CreateFrameDto) {
    try {
      const newFrame = await this.prisma.frame.create({
        data: createFrameDto,
      });
      return newFrame;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create the frame');
    }
  }
  findAll() {
    return `This action returns all frame`;
  }

  findOne(id: number) {
    return `This action returns a #${id} frame`;
  }

  update(id: number, updateFrameDto: UpdateFrameDto) {
    return `This action updates a #${id} frame`;
  }

  remove(id: number) {
    return `This action removes a #${id} frame`;
  }
}

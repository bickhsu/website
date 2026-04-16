import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { UpdateSequenceDto } from './dto/update-sequence.dto';

@Injectable()
export class SequenceService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createSequenceDto: CreateSequenceDto) {
    return this.prisma.sequence.create({
      data: createSequenceDto,
    });
  }

  async findAll() {
    return this.prisma.sequence.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sequence = await this.prisma.sequence.findUnique({
      where: { id },
      include: { sequenceFrames: true },
    });

    if (!sequence) {
      throw new NotFoundException(`Sequence with ID ${id} not found.`);
    }
    return sequence;
  }

  async update(id: string, updateSequenceDto: UpdateSequenceDto) {
    return this.prisma.sequence.update({
      where: { id },
      data: updateSequenceDto,
    });
  }

  async remove(id: string) {
    const { count } = await this.prisma.sequence.deleteMany({
      where: { id },
    });

    return {
      id,
      deleted: count > 0,
      message: count > 0 ? 'Deleted successfully' : 'Already non-existent',
    };
  }
}

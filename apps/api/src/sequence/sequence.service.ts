import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSequenceDto } from './dto/create-sequence.dto';
import { UpdateSequenceDto } from './dto/update-sequence.dto';

@Injectable()
export class SequenceService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createSequenceDto: CreateSequenceDto) {
    try {
      const newSequence = await this.prisma.sequence.create({
        data: createSequenceDto,
      });
      return newSequence;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create the sequence');
    }
  }

  async findAll() {
    try {
      return await this.prisma.sequence.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch sequences.');
    }
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
    try {
      return await this.prisma.sequence.update({
        where: { id },
        data: updateSequenceDto,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update the sequence.')
    }
  }

  async remove(id: string) {
    try {
      const { count } = await this.prisma.sequence.deleteMany({
        where: { id },
      });
      return {
        id,
        deleted: count > 0,
        message: count > 0 ? 'Deleted successfully' : 'Already non-existent',
      }
    } catch (error) {
      throw new InternalServerErrorException('Database execution failed.')
    }
  }
}

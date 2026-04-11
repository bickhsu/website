import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
      throw new InternalServerErrorException('Failed to create the Sequence entity in database.');
    }
  }

  async findAll() {
    return `This action returns all sequence`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} sequence`;
  }

  async update(id: number, updateSequenceDto: UpdateSequenceDto) {
    return `This action updates a #${id} sequence`;
  }

  async remove(id: number) {
    return `This action removes a #${id} sequence`;
  }
}

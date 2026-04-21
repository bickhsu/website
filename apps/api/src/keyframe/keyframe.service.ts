import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKeyframeDto } from './dto/create-keyframe.dto';
import { UpdateKeyframeDto } from './dto/update-keyframe.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class KeyframeService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createKeyframeDto: CreateKeyframeDto) {
    return this.prisma.keyframe.create({
      data: createKeyframeDto,
    });
  }

  async addFrame(keyframeId: string, content: string) {
    return this.prisma.keyframeFrame.create({
      data: {
        keyframeId,
        frame: {
          create: { content },
        },
      },
      include: {
        frame: true,
      },
    });
  }

  async findAll() {
    return this.prisma.keyframe.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const keyframe = await this.prisma.keyframe.findUnique({
      where: { id },
      include: {
        keyframeFrames: {
          include: {
            frame: true
          }
        }
      },
    });

    if (!keyframe) {
      throw new NotFoundException(`Keyframe with ID ${id} not found`);
    }

    return keyframe;
  }

  async update(id: string, updateKeyframeDto: UpdateKeyframeDto) {
    return this.prisma.keyframe.update({
      where: { id },
      data: updateKeyframeDto,
    });
  }

  async remove(id: string) {
    const { count } = await this.prisma.keyframe.deleteMany({
      where: { id },
    });

    return {
      id,
      deleted: count > 0,
      message: count > 0 ? 'Deleted successfully' : 'Already non-existent',
    };
  }
}

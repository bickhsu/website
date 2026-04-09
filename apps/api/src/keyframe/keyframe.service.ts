import { Injectable } from '@nestjs/common';
import { CreateKeyframeDto } from './dto/create-keyframe.dto';
import { UpdateKeyframeDto } from './dto/update-keyframe.dto';

@Injectable()
export class KeyframeService {
  create(createKeyframeDto: CreateKeyframeDto) {
    return 'This action adds a new keyframe';
  }

  findAll() {
    return `This action returns all keyframe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} keyframe`;
  }

  update(id: number, updateKeyframeDto: UpdateKeyframeDto) {
    return `This action updates a #${id} keyframe`;
  }

  remove(id: number) {
    return `This action removes a #${id} keyframe`;
  }
}

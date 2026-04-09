import { PartialType } from '@nestjs/mapped-types';
import { CreateKeyframeDto } from './create-keyframe.dto';

export class UpdateKeyframeDto extends PartialType(CreateKeyframeDto) {}

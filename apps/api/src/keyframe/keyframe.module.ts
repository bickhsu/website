import { Module } from '@nestjs/common';
import { KeyframeService } from './keyframe.service';
import { KeyframeController } from './keyframe.controller';

@Module({
  controllers: [KeyframeController],
  providers: [KeyframeService],
})
export class KeyframeModule {}

import { Module } from '@nestjs/common';
import { FrameService } from './frame.service';
import { FrameController } from './frame.controller';

@Module({
  controllers: [FrameController],
  providers: [FrameService],
})
export class FrameModule {}

import { Module } from '@nestjs/common';
import { SequenceService } from './sequence.service';
import { SequenceController } from './sequence.controller';

@Module({
  controllers: [SequenceController],
  providers: [SequenceService],
})
export class SequenceModule {}

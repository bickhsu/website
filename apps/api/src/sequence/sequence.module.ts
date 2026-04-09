import { Module } from '@nestjs/common';
import { FragmentService } from './sequence.service';
import { FragmentController } from './sequence.controller';

@Module({
  controllers: [FragmentController],
  providers: [FragmentService],
})
export class FragmentModule { }

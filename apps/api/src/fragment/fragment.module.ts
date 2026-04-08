import { Module } from '@nestjs/common';
import { FragmentService } from './fragment.service';
import { FragmentController } from './fragment.controller';

@Module({
  controllers: [FragmentController],
  providers: [FragmentService],
})
export class FragmentModule {}

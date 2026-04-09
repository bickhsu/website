import { Test, TestingModule } from '@nestjs/testing';
import { SequenceController } from './sequence.controller';
import { SequenceService } from './sequence.service';

describe('SequenceController', () => {
  let controller: SequenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SequenceController],
      providers: [SequenceService],
    }).compile();

    controller = module.get<SequenceController>(SequenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

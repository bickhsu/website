import { Test, TestingModule } from '@nestjs/testing';
import { KeyframeController } from './keyframe.controller';
import { KeyframeService } from './keyframe.service';

describe('KeyframeController', () => {
  let controller: KeyframeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeyframeController],
      providers: [KeyframeService],
    }).compile();

    controller = module.get<KeyframeController>(KeyframeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

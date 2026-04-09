import { Test, TestingModule } from '@nestjs/testing';
import { FrameController } from './frame.controller';
import { FrameService } from './frame.service';

describe('FrameController', () => {
  let controller: FrameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrameController],
      providers: [FrameService],
    }).compile();

    controller = module.get<FrameController>(FrameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

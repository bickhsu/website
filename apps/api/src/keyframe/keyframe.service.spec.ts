import { Test, TestingModule } from '@nestjs/testing';
import { KeyframeService } from './keyframe.service';

describe('KeyframeService', () => {
  let service: KeyframeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeyframeService],
    }).compile();

    service = module.get<KeyframeService>(KeyframeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

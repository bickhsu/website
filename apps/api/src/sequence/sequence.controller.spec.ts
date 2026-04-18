import { Test, TestingModule } from '@nestjs/testing';
import { SequenceController } from './sequence.controller';
import { SequenceService } from './sequence.service';

describe('SequenceController', () => {
  let controller: SequenceController;
  let service: SequenceService;

  const mockSequenceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SequenceController],
      providers: [
        {
          provide: SequenceService,
          useValue: mockSequenceService,
        },
      ],
    }).compile();

    controller = module.get<SequenceController>(SequenceController);
    service = module.get<SequenceService>(SequenceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { name: 'Test' };
      mockSequenceService.create.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.create(dto as any);
      expect(result).toEqual({ id: '1', ...dto });
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      const expectedResult = [{ id: '1', name: 'Test' }];
      mockSequenceService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      const expectedResult = { id: '1', name: 'Test' };
      mockSequenceService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should call service.update', async () => {
      const dto = { name: 'Updated' };
      mockSequenceService.update.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.update('1', dto as any);
      expect(result).toEqual({ id: '1', ...dto });
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      const expectedResult = { id: '1', deleted: true, message: 'Deleted' };
      mockSequenceService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});

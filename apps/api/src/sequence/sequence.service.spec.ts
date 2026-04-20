import { Test, TestingModule } from '@nestjs/testing';
import { SequenceService } from './sequence.service';
import { PrismaService } from '../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SequenceService', () => {
  let service: SequenceService;
  let prisma: PrismaService;

  const mockPrismaService = {
    sequence: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SequenceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SequenceService>(SequenceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a sequence', async () => {
      const dto = { name: 'Test Sequence' };
      const expectedResult = { id: '1', ...dto };
      mockPrismaService.sequence.create.mockResolvedValue(expectedResult);

      const result = await service.create(dto as any);
      expect(result).toEqual(expectedResult);
      expect(prisma.sequence.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return an array of sequences', async () => {
      const expectedResult = [{ id: '1', name: 'Test' }];
      mockPrismaService.sequence.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(result).toEqual(expectedResult);
      expect(prisma.sequence.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a sequence if found', async () => {
      const expectedResult = { 
        id: '1', 
        name: 'Test', 
        sequenceFrames: [],
        sequenceKeyframes: [] 
      };
      mockPrismaService.sequence.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne('1');
      expect(result).toEqual(expectedResult);
      expect(prisma.sequence.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          sequenceFrames: {
            include: {
              frame: true,
            },
            orderBy: {
              addedAt: 'asc',
            },
          },
          sequenceKeyframes: {
            include: {
              keyframe: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if sequence not found', async () => {
      mockPrismaService.sequence.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a sequence', async () => {
      const dto = { name: 'Updated' };
      const expectedResult = { id: '1', ...dto };
      mockPrismaService.sequence.update.mockResolvedValue(expectedResult);

      const result = await service.update('1', dto as any);
      expect(result).toEqual(expectedResult);
      expect(prisma.sequence.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
    });
  });

  describe('addFrame', () => {
    it('should create a sequence frame', async () => {
      const content = 'Test comment';
      const expectedResult = { sequenceId: '1', frame: { id: 'f1', content } };
      mockPrismaService.sequenceFrame = { create: jest.fn().mockResolvedValue(expectedResult) };

      const result = await service.addFrame('1', content);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.sequenceFrame.create).toHaveBeenCalledWith({
        data: {
          sequence: {
            connect: { id: '1' },
          },
          frame: {
            create: { content },
          },
        },
        include: {
          frame: true,
        },
      });
    });
  });

  describe('remove', () => {
    it('should return success message if deleted', async () => {
      mockPrismaService.sequence.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.remove('1');
      expect(result).toEqual({
        id: '1',
        deleted: true,
        message: 'Deleted successfully',
      });
      expect(prisma.sequence.deleteMany).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return failure message if not found to delete', async () => {
      mockPrismaService.sequence.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.remove('1');
      expect(result).toEqual({
        id: '1',
        deleted: false,
        message: 'Already non-existent',
      });
    });
  });
});

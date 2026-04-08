import { Provider } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from './prisma.service';

/**
 * A strongly-typed deep mock proxy for the PrismaService.
 * Can be used directly in Jest test suites:
 * 
 * @example
 * mockPrisma.articles.findMany.mockResolvedValue([...]);
 */
export const mockPrisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

/**
 * A pre-configured NestJS provider you can pass to the testing module.
 * 
 * @example
 * const module: TestingModule = await Test.createTestingModule({
 *   providers: [mockPrismaServiceProvider],
 *   // ...
 * }).compile();
 */
export const mockPrismaServiceProvider: Provider = {
  provide: PrismaService,
  useValue: mockPrisma,
};

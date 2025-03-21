import { Repository } from 'typeorm';

/**
 * Type definition for mocked repository
 */
export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

/**
 * Factory function to create a mock repository
 */
export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findOneById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  preload: jest.fn(),
  count: jest.fn(),
  findAndCount: jest.fn(),
  query: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    execute: jest.fn(),
  })),
}));

/**
 * Factory function to create a mock service
 */
export const serviceMockFactory = <T>(service: T) => {
  const mockService: any = {};
  
  // Create mock functions for all properties in the service
  Object.getOwnPropertyNames(Object.getPrototypeOf(service))
    .filter(prop => prop !== 'constructor')
    .forEach(method => {
      mockService[method] = jest.fn();
    });
  
  return mockService as MockType<T>;
}; 
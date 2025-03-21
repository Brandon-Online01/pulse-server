import { Test, TestingModule } from '@nestjs/testing';
import { CompetitorsController } from './competitors.controller';
import { CompetitorsService } from './competitors.service';

describe('CompetitorsController', () => {
  let controller: CompetitorsController;
  let serviceMock: any;

  beforeEach(async () => {
    // Create direct service mock instead of using the actual service constructor
    serviceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetitorsController],
      providers: [
        {
          provide: CompetitorsService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<CompetitorsController>(CompetitorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of competitors', async () => {
      // Arrange
      const competitors = {
        items: [
          { id: 1, name: 'Competitor 1' },
          { id: 2, name: 'Competitor 2' },
        ],
        meta: { total: 2, page: 1, limit: 10 }
      };
      serviceMock.findAll.mockReturnValue(competitors);
      const mockReq = { user: { org: { uid: 'org123' }, branch: { uid: 'branch123' } } };
      const filterDto = {};

      // Act
      const result = await controller.findAll(filterDto, 1, 10, mockReq);

      // Assert
      expect(result).toEqual(competitors);
      expect(serviceMock.findAll).toHaveBeenCalledWith(
        filterDto, 1, 10, 'org123', 'branch123'
      );
    });
  });

  describe('findOne', () => {
    it('should return a single competitor', async () => {
      // Arrange
      const competitor = { id: 1, name: 'Competitor 1' };
      serviceMock.findOne.mockReturnValue(competitor);
      const mockReq = { user: { org: { uid: 'org123' }, branch: { uid: 'branch123' } } };

      // Act
      const result = await controller.findOne('1', mockReq);

      // Assert
      expect(result).toEqual(competitor);
      expect(serviceMock.findOne).toHaveBeenCalledWith(1, 'org123', 'branch123');
    });
  });

  describe('create', () => {
    it('should create a competitor', async () => {
      // Arrange
      const createDto = { name: 'New Competitor' } as any;
      const newCompetitor = { id: 1, ...createDto };
      const mockUser = { id: 'user123' };
      const mockReq = { 
        user: { 
          ...mockUser,
          org: { uid: 'org123' }, 
          branch: { uid: 'branch123' } 
        } 
      };
      
      serviceMock.create.mockReturnValue(newCompetitor);

      // Act
      const result = await controller.create(createDto, mockReq);

      // Assert
      expect(result).toEqual(newCompetitor);
      expect(serviceMock.create).toHaveBeenCalledWith(
        createDto, mockReq.user, 'org123', 'branch123'
      );
    });
  });

  describe('update', () => {
    it('should update a competitor', async () => {
      // Arrange
      const updateDto = { name: 'Updated Competitor' } as any;
      const updatedCompetitor = { id: 1, name: 'Updated Competitor' };
      const mockReq = { user: { org: { uid: 'org123' }, branch: { uid: 'branch123' } } };
      
      serviceMock.update.mockReturnValue(updatedCompetitor);

      // Act
      const result = await controller.update('1', updateDto, mockReq);

      // Assert
      expect(result).toEqual(updatedCompetitor);
      expect(serviceMock.update).toHaveBeenCalledWith(
        1, updateDto, 'org123', 'branch123'
      );
    });
  });

  describe('remove', () => {
    it('should remove a competitor', async () => {
      // Arrange
      serviceMock.remove.mockReturnValue(undefined);
      const mockReq = { user: { org: { uid: 'org123' }, branch: { uid: 'branch123' } } };

      // Act
      const result = await controller.remove('1', mockReq);

      // Assert
      expect(result).toBeUndefined();
      expect(serviceMock.remove).toHaveBeenCalledWith(1, 'org123', 'branch123');
    });
  });
});

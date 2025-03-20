import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackType, FeedbackStatus } from '../lib/enums/feedback.enums';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let service: FeedbackService;

  const mockFeedbackService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    validateToken: jest.fn(),
    getFeedbackStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
      ],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
    service = module.get<FeedbackService>(FeedbackService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new feedback', async () => {
      const createFeedbackDto: CreateFeedbackDto = {
        type: FeedbackType.TASK,
        title: 'Test Feedback',
        comments: 'This is a test feedback',
        rating: 5,
      };

      const mockResult = {
        message: 'Feedback submitted successfully',
        feedback: {
          uid: 1,
          ...createFeedbackDto,
          status: FeedbackStatus.NEW,
        },
      };

      mockFeedbackService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createFeedbackDto, {});

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(createFeedbackDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated feedback results', async () => {
      const mockResult = {
        data: [
          {
            uid: 1,
            type: FeedbackType.TASK,
            title: 'Test Feedback 1',
            comments: 'Comments 1',
          },
          {
            uid: 2,
            type: FeedbackType.SERVICE,
            title: 'Test Feedback 2',
            comments: 'Comments 2',
          },
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        message: 'Feedback retrieved successfully',
      };

      mockFeedbackService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(1, 10, FeedbackType.TASK, FeedbackStatus.NEW, 1, 1, 1, new Date(), new Date());

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
}); 
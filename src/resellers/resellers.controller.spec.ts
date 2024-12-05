import { Test, TestingModule } from '@nestjs/testing';
import { ResellersController } from './resellers.controller';
import { ResellersService } from './resellers.service';

describe('ResellersController', () => {
  let controller: ResellersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResellersController],
      providers: [ResellersService],
    }).compile();

    controller = module.get<ResellersController>(ResellersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

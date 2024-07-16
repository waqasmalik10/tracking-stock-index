import { Test, TestingModule } from '@nestjs/testing';
import { IndicesController } from './indices.controller';

describe('IndicesController', () => {
  let controller: IndicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndicesController],
    }).compile();

    controller = module.get<IndicesController>(IndicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

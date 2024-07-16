import { Test, TestingModule } from '@nestjs/testing';
import { IndicesService } from './indices.service';

describe('IndicesService', () => {
  let service: IndicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndicesService],
    }).compile();

    service = module.get<IndicesService>(IndicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

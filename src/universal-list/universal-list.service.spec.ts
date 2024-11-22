import { Test, TestingModule } from '@nestjs/testing';
import { UniversalListService } from './universal-list.service';

describe('UniversalListService', () => {
  let service: UniversalListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniversalListService],
    }).compile();

    service = module.get<UniversalListService>(UniversalListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

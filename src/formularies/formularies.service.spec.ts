import { Test, TestingModule } from '@nestjs/testing';
import { FormulariesService } from './formularies.service';

describe('FormulariesService', () => {
  let service: FormulariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormulariesService],
    }).compile();

    service = module.get<FormulariesService>(FormulariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

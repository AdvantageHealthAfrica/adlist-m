import { Test, TestingModule } from '@nestjs/testing';
import { BusinessUnitProductsService } from './business-unit-products.service';

describe('BusinessUnitProductsService', () => {
  let service: BusinessUnitProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessUnitProductsService],
    }).compile();

    service = module.get<BusinessUnitProductsService>(BusinessUnitProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

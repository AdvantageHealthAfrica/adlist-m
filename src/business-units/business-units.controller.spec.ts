import { Test, TestingModule } from '@nestjs/testing';
import { BusinessUnitsController } from './business-units.controller';

describe('BusinessUnitsController', () => {
  let controller: BusinessUnitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessUnitsController],
    }).compile();

    controller = module.get<BusinessUnitsController>(BusinessUnitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

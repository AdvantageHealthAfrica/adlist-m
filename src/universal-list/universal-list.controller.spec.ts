import { Test, TestingModule } from '@nestjs/testing';
import { UniversalListController } from './universal-list.controller';

describe('UniversalListController', () => {
  let controller: UniversalListController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UniversalListController],
    }).compile();

    controller = module.get<UniversalListController>(UniversalListController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

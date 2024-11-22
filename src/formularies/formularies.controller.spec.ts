import { Test, TestingModule } from '@nestjs/testing';
import { FormulariesController } from './formularies.controller';

describe('FormulariesController', () => {
  let controller: FormulariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormulariesController],
    }).compile();

    controller = module.get<FormulariesController>(FormulariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

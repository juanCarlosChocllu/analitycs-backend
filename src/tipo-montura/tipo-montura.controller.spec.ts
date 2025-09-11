import { Test, TestingModule } from '@nestjs/testing';
import { TipoMonturaController } from './tipo-montura.controller';
import { TipoMonturaService } from './tipo-montura.service';

describe('TipoMonturaController', () => {
  let controller: TipoMonturaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoMonturaController],
      providers: [TipoMonturaService],
    }).compile();

    controller = module.get<TipoMonturaController>(TipoMonturaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

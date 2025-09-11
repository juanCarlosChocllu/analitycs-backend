import { Test, TestingModule } from '@nestjs/testing';
import { TipoMonturaService } from './tipo-montura.service';

describe('TipoMonturaService', () => {
  let service: TipoMonturaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoMonturaService],
    }).compile();

    service = module.get<TipoMonturaService>(TipoMonturaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

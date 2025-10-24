import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CicloComercial } from './schema/ciclo-comercial.schema';
import { Model } from 'mongoose';

@Injectable()
export class CicloComercialService {
  constructor(
    @InjectModel(CicloComercial.name)
    private readonly cicloComercial: Model<CicloComercial>,
  ) {}

  async registrarCicloComercial(
    fechaInicio: string,
    fechaFin: string,
    dias: number,
  ) {
    const ciclo = await this.cicloComercial.findOne({
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
    });
    if (!ciclo) {
      await this.cicloComercial.create({
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        diasComerciales: dias,
      });
    }
  }
}

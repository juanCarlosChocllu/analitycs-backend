import { Injectable, NotFoundException } from '@nestjs/common';
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
      const countDocuments = (await this.cicloComercial.countDocuments()) + 1;
      await this.cicloComercial.create({
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        diasComerciales: dias,
        orden: countDocuments,
      });
    }
  }

  async listar() {
    const ciclo = await this.cicloComercial.find();
    if (ciclo.length <= 0) {
      throw new NotFoundException(
        'No se ecuentra definida el ciclo  comercial',
      );
    }
    return this.cicloComercial.findOne().sort({ orden: -1 });
  }
}

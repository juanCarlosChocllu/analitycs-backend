import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Tratamiento } from './schema/tratamiento.schema';
import { Model } from 'mongoose';

@Injectable()
export class TratamientoService {
  constructor(
    @InjectModel(Tratamiento.name)
    private readonly TratamientoSchema: Model<Tratamiento>,
  ) {}

  public async guardarTratamiento(tratamiento: string) {
    const trata = await this.TratamientoSchema.findOne({ nombre: tratamiento });
    if (!trata) {
      return this.TratamientoSchema.create({ nombre: tratamiento });
    }
    return trata
  }

  
}

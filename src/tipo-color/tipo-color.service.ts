import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TipoColor } from './schema/tipo-color.schema';
import { Model } from 'mongoose';

@Injectable()
export class TipoColorService {
  constructor(
    @InjectModel(TipoColor.name)
    private readonly tipoColorSchema: Model<TipoColor>,
  ) {}

  public async guardarTipoColor(tipoColor: string) {
    const tColor = await this.tipoColorSchema.findOne({ nombre: tipoColor });
    if (!tColor) {
      return this.tipoColorSchema.create({ nombre: tipoColor });
    }
    return tColor;
  }

 
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { TipoVenta } from './schemas/tipo-venta.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';



@Injectable()
export class TipoVentaService {
  constructor(
    @InjectModel(TipoVenta.name)
    private readonly tipoVenta: Model<TipoVenta>,
  ) {}
  listarTipoVenta() {
    return this.tipoVenta.find();
  }
  public async guardarTipoVenta(nombre: string) {
    const tipoVenta = await this.tipoVenta.findOne({nombre: nombre});
    if(!tipoVenta){
      return await this.tipoVenta.create({nombre:nombre})
    }
    return tipoVenta;
  }

}

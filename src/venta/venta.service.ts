import { Injectable } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta } from './schema/venta.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { VentaI, VentaIOpcional } from './interface/venta';
import { DetalleVenta } from './schema/detalleVenta';
import { detalleVentaI } from './interface/detalleVenta';

@Injectable()
export class VentaService {
 constructor(
    @InjectModel(Venta.name)
    private readonly venta: Model<Venta>,
     @InjectModel(DetalleVenta.name)
    private readonly detalleVenta: Model<DetalleVenta>,
  ) {}

  async guardarVenta(ventaData:VentaIOpcional){
    const venta = await this.venta.findOne({id_venta:ventaData.id_venta})
    if(!venta){
      return this.venta.create(ventaData)
    }
    return venta
  }

  async guardarDetalleVenta(data:detalleVentaI){
     const detalle = await this.detalleVenta.findOne({rubro:data.rubro, venta:data.venta})
     if(!detalle) {
      return this.detalleVenta.create(data)
     }
  
   } 
}

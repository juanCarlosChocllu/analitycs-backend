import { Injectable } from '@nestjs/common';
import { Venta } from '../schema/venta.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CodigoMiaProductoI, VentaI, VentaIOpcional } from '../interface/venta';
import { DetalleVenta } from '../schema/detalleVenta';
import { detalleVentaI } from '../interface/detalleVenta';
import { DescargarProviderDto } from 'src/providers/dto/DescargarProviderDto';
import { formaterFechaHora } from 'src/core-app/utils/coreAppUtils';

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

    public async buscarProductoDeVenta(
    descargarProviderDto: DescargarProviderDto,
  ): Promise<CodigoMiaProductoI[]> {
    const { f1, f2 } = formaterFechaHora(
      descargarProviderDto.fechaInicio,
      descargarProviderDto.fechaFin,
    );
    const venta: CodigoMiaProductoI[] = await this.venta.aggregate([
      {
        $match: {
          fechaVenta: {
            $gte: f1,
            $lte: f2,
          },
          estadoTracking: { $ne: 'ANULADO' },
        },
      },
      {
        $lookup: {
          from: 'DetalleVenta',
          foreignField: 'venta',
          localField: '_id',
          as: 'DetalleVenta',
        },
      },
      {
        $unwind: { path: '$DetalleVenta', preserveNullAndEmptyArrays: false },
      },
      {
        $match: {
          'DetalleVenta.rubro': {
            $in: ['MONTURA', 'GAFA', 'LENTE DE CONTACTO'],
          },
        },
      },
      {
        $lookup: {
          from: 'Producto',
          localField: 'DetalleVenta.producto',
          foreignField: '_id',
          as: 'producto',
        },
      },
      {
        $project: {
          _id: 0,
          producto: { $arrayElemAt: ['$producto._id', 0] },
          codigoMia: { $arrayElemAt: ['$producto.codigoMia', 0] },
        },
      },
    ]);    


    return venta;
  }
}

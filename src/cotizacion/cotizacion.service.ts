import { Injectable } from '@nestjs/common';
import { Cotizacion } from './schema/cotizacion.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DetalleCotizacion } from './schema/detalleContizacion';
import { CotizacionI, DetalleCotizacionI } from './interface/cotizacion';
import { BuscadorCotizacionDto } from './dto/BuscadorCotizacion.dto';

@Injectable()
export class CotizacionService {
  constructor(
    @InjectModel(Cotizacion.name)
    private readonly cotizacion: Model<Cotizacion>,
    @InjectModel(DetalleCotizacion.name)
    private readonly detalleCotizacion: Model<DetalleCotizacion>,
  ) {}

  public async guardarCotizacion(data: CotizacionI) {
    const cot = await this.cotizacion.findOne({ codigo: data.codigo });
    if (!cot) {
      return this.cotizacion.create(data);
    }
    return cot;
  }

  public async guardaDetalleCotizacion(data: DetalleCotizacionI) {
    if (data.rubro == 'LENTE') {
      const detalle = await this.detalleCotizacion.findOne({
        cotizacion: data.cotizacion,
        rubro: data.rubro,
        tipo: data.tipo,
      });
      if (!detalle) {
        return this.detalleCotizacion.create(data);
      }
    } else {
      const detalle = await this.detalleCotizacion.findOne({
        cotizacion: data.cotizacion,
        rubro: data.rubro,
      });
      if (!detalle) {
        return this.detalleCotizacion.create(data);
      }
    }
  }

  public async cantidadCotizaciones(
    rubro: string[],
    producto: Types.ObjectId[],
    fechaInicio: Date,
    fechaFin: Date,
    sucursal: Types.ObjectId,
  ) {
    const detalle = await this.detalleCotizacion.aggregate([
      {
        $match: {
          rubro: { $in: rubro },
          producto: { $in: producto.map((item) => new Types.ObjectId(item)) },
        },
      },
      {
        $lookup: {
          from: 'Cotizacion',
          foreignField: '_id',
          localField: 'cotizacion',
          as: 'cotizacion',
        },
      },
      {
        $match: {
          'cotizacion.0.sucursal': new Types.ObjectId(sucursal),
          'cotizacion.0.fechaCotizacion': {
            $gte: fechaInicio,
            $lte: fechaFin,
          },
        },
      },
    ]);

    /* const detalle = await this.cotizacion.aggregate([
       {
        $match: {
          sucursal: new Types.ObjectId(sucursal),
          fechaCotizacion: {
            $gte: fechaInicio,
            $lte: fechaFin,
          },
        },
      },
   
      {
        $lookup: {
          from: 'DetalleCotizacion',
          foreignField: 'cotizacion',
          localField: '_id',
          as: 'detalle',
        },
      },
      {
        $unwind:{path:"$detalle", preserveNullAndEmptyArrays:false}
      },
        {
        $match: {
           'detalle.rubro': { $in: rubro },
          'detalle.producto': { $in: producto.map((item) => new Types.ObjectId(item)) },
        },
      },
      {
        $project:{
          _d:1
        }
      }
    ])*/

    return detalle.length;
  }

  contarCotizaciones(
    sucursal: Types.ObjectId,
    fechaInicio: Date,
    fechaFin: Date,
  ) {
    return this.cotizacion.countDocuments({
      sucursal: new Types.ObjectId(sucursal),
      fechaCotizacion: {
        $gte: fechaInicio,
        $lte: fechaFin,
      },
    });
  }

  async reporteCotizacion(buscadorCotizacionDto: BuscadorCotizacionDto) {
    const cotizacion = await this.cotizacion.aggregate([
      {
        $match: {
          sucursal :{$in:buscadorCotizacionDto.sucursal.map((item)=> new Types.ObjectId(item))},
          fechaCotizacion: {
            $gte: buscadorCotizacionDto.fechaInicio,
            $lte: buscadorCotizacionDto.fechaFin,
          },
        },
      },
      {
        $lookup: {
          from: 'DetalleCotizacion',
          foreignField: 'cotizacion',
          localField: '_id',
          as: 'detalleCotizacion',
        },
      },
      {
        $lookup: {
          from: 'Sucursal',
          foreignField: '_id',
          localField: 'sucursal',
          as: 'sucursal',
        },
      },
      {
        $lookup: {
          from: 'DetalleAsesor',
          foreignField: '_id',
          localField: 'detalleAsesor',
          as: 'detalleAsesor',
        },
      },
      {
        $lookup: {
          from: 'Asesor',
          foreignField: '_id',
          localField: 'detalleAsesor.0.asesor',
          as: 'asesor',
        },
      },
      {
        $project: {
          codigo: 1,
          noCompra: 1,
          fechaCotizacion: 1,
          asesor: { $arrayElemAt: ['$asesor.nombre', 0] },
          sucursal: { $arrayElemAt: ['$sucursal.nombre', 0] },
          total1: 1,
          total2: 1,
          detalleCotizacion: 1,
          venta: 1,
          id_venta: 1,
        },
      },
    ]);

    return cotizacion;
  }
}

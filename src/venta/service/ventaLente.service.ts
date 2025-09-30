import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DetalleVenta } from '../schema/detalleVenta';
import { Venta } from '../schema/venta.schema';
import { Model, Types } from 'mongoose';
import { BuscadorVentaDto } from '../dto/BuscadorVenta.dto';
import { filtradorVenta } from '../utils/filtroVenta';
import { Type } from 'class-transformer';
import { ProductoE } from 'src/core-app/enum/coreEnum';

@Injectable()
export class VentaLentService {
  constructor(
    @InjectModel(Venta.name)
    private readonly venta: Model<Venta>,
    @InjectModel(DetalleVenta.name)
    private readonly detalleVenta: Model<DetalleVenta>,
  ) {}

  public async kpiMaterial(kpiDto: BuscadorVentaDto) {
    const data: any[] = [];
    const filtrador = filtradorVenta(kpiDto);
    for (let su of kpiDto.sucursal) {
      const kpiMaterial = await this.venta.aggregate([
        {
          $match: {
            ...filtrador,
            sucursal: new Types.ObjectId(su),
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
            from: 'DetalleVenta',
            foreignField: 'venta',
            localField: '_id',
            as: 'detalleVenta',
          },
        },
        {
          $unwind: { path: '$detalleVenta', preserveNullAndEmptyArrays: false },
        },
        {
          $match: {
            'detalleVenta.rubro': ProductoE.lente,
          },
        },
        {
          $lookup: {
            from: 'Receta',
            foreignField: '_id',
            localField: 'detalleVenta.receta',
            as: 'receta',
          },
        },
        {
          $lookup: {
            from: 'Material',
            foreignField: '_id',
            localField: 'receta.0.material',
            as: 'material',
          },
        },

        {
          $unwind: { path: '$material', preserveNullAndEmptyArrays: false },
        },

        {
          $group: {
            _id: '$material.nombre',
            cantidad: { $sum: '$detalleVenta.cantidad' },
            sucursalNombre: {
              $first: { $arrayElemAt: ['$sucursal.nombre', 0] },
            },
          },
        },

        {
          $group: {
            _id: null,
            lentes: {
              $sum: '$cantidad',
            },
            materiales: {
              $push: {
                nombre: '$_id',
                cantidad: '$cantidad',
              },
            },
            sucursalNombre: { $first: '$sucursalNombre' },
          },
        },
        {
          $project: {
            _id: 0,
            lentes: 1,
            sucursal: '$sucursalNombre',
            materiales: {
              $map: {
                input: '$materiales',
                as: 'material',
                in: {
                  nombre: '$$material.nombre',
                  cantidad: '$$material.cantidad',
                  porcentaje: {
                    $round: [
                      {
                        $multiply: [
                          { $divide: ['$$material.cantidad', '$lentes'] },
                          100,
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
      ]);
      const resultado = {
        kpiMaterial: kpiMaterial[0],
      };
      data.push(resultado);
    }
    return data;
  }
}

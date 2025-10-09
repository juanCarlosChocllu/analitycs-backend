import { Injectable } from '@nestjs/common';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { Stock } from './schema/stockSchema';
import { Model, Types, PipelineStage } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AlmacenService } from 'src/almacen/almacen.service';
import { StockMia } from 'src/providers/interface/stockMia';
import { StockI } from './interface/stock';
import { CodigoMiaProductoI } from 'src/venta/interface/venta';
import { StockHistorial } from './schema/StockHistorialSchema';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Stock.name) private readonly stock: Model<Stock>,
    @InjectModel(StockHistorial.name)
    private readonly stockHistorial: Model<StockHistorial>,
    private readonly sucursalService: SucursalService,
    private readonly almacenService: AlmacenService,
  ) {}

  async guardarStockMia(ventas: CodigoMiaProductoI[], stocks: StockMia[]) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    for (const v of ventas) {
      for (const dataMia of stocks) {
        if (v.codigoMia === dataMia.codigoMiaProducto) {
          if (dataMia.almacen) {
            const almacen = await this.almacenService.verificarAlmacen(
              dataMia.almacen,
            );

            const stockH = await this.stockHistorial.countDocuments({
              almacen: almacen._id,
              fechaStock: date,
              producto: v.producto,
              tipo: 'ALMACEN',
            });

            if (stockH <= 0) {
              await this.stockHistorial.create({
                almacen: almacen._id,
                cantidad: dataMia.cantidad,
                fechaStock: date,
                producto: v.producto,
                tipo: 'ALMACEN',
              });
            }
          }

          if (dataMia.sucursal) {
            const sucursal = await this.sucursalService.guardarSucursalVenta(
              dataMia.sucursal,
            );
            const stockH = await this.stockHistorial.countDocuments({
              sucursal: sucursal._id,
              fechaStock: date,
              producto: v.producto,
              tipo: 'SUCURSAL',
            });
            if (stockH <= 0) {
              await this.stockHistorial.create({
                sucursal: sucursal._id,
                cantidad: dataMia.cantidad,
                fechaStock: date,
                producto: v.producto,
                tipo: 'SUCURSAL',
              });
            }
          }
        }
      }
    }
  }

  async buscarStockVenta(producto: Types.ObjectId[], fechaInicio:Date, fechaFin:Date) {     
    const pipeline: PipelineStage[] = [
      {
        $match: {
          producto: { $in: producto },
          fechaStock:{
            $gte:fechaInicio,
            $lte:fechaFin
          }
        },
      },
      {
        $group: {
          _id: '$tipo',
          cantidad: { $sum: '$cantidad' },
        },
      },
      {
        $project: {
          _id: 0,
          tipo: '$_id',
          cantidad: 1,
        },
      },
    ];
    const stock = await this.stockHistorial.aggregate<{
      tipo: string;
      cantidad: number;
    }>(pipeline);
 
    return stock;
  }
}

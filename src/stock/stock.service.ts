import { Injectable } from '@nestjs/common';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { Stock } from './schema/stockSchema';
import { Model, Types, PipelineStage } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AlmacenService } from 'src/almacen/almacen.service';
import { StockMia } from 'src/providers/interface/stockMia';
import { StockI } from './interface/stock';
import { CodigoMiaProductoI } from 'src/venta/interface/venta';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Stock.name) private readonly stock: Model<Stock>,
    private readonly sucursalService: SucursalService,
    private readonly almacenService: AlmacenService,
  ) {}

  async guardarStockMia(data: StockMia[], venta: CodigoMiaProductoI[]) {
    for (const v of venta) {
      const stock: StockMia[] = [];
      for (const dataMia of data) {
        if (v.codigoMia === dataMia.codigoMiaProducto) {
          stock.push(dataMia);
        }
      }

      for (const da of stock) {
        if (da.lugar === 'SUCURSAL') {
          const sucursal = await this.sucursalService.guardarSucursalVenta(
            da.sucursal,
          );

          if (sucursal) {
            await this.verificarStock(
              da.codigoStockMia,
              da.cantidad,
              v.producto,
              da.lugar,
              sucursal._id,
              undefined,
            );
          }
        } else if (da.lugar === 'ALMACEN') {
          const almacen = await this.almacenService.verificarAlmacen(
            da.almacen,
          );
          await this.verificarStock(
            da.codigoStockMia,
            da.cantidad,
            v.producto,
            da.lugar,
            undefined,
            almacen._id,
          );
        }
      }
    }
  }

  private async verificarStock(
    codigoStock: string,
    cantidad: number,
    producto: Types.ObjectId,
    tipo: string,
    sucursal?: Types.ObjectId,
    almacen?: Types.ObjectId,
  ) {
    const date = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const diaRegistro: string = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate() - 1)}`;
    const data: StockI = {
      cantidad: cantidad,
      producto: producto,
      tipo: tipo,
      codigoStock: codigoStock,
      fechaDescarga: diaRegistro,
      fechaCreacion: date,
      ...(tipo === 'ALMACEN' ? { almacen: almacen } : { sucursal: sucursal }),
    };

    const stock = await this.stock.findOne({
      fechaDescarga: diaRegistro,
      producto: producto,
      ...(almacen ? { almacen: almacen } : { sucursal: sucursal }),
    });

    if (!stock) {
      await this.stock.create(data);
    }
  }

  async buscarStockVenta(producto: Types.ObjectId[]) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          producto: { $in: producto },
          cantidad: { $gt: 0 },
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
    const stock = await this.stock.aggregate<{
      tipo: string;
      cantidad: number;
    }>(pipeline)
    return stock;
  }
}

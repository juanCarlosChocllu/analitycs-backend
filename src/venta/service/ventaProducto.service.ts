import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DetalleVenta } from '../schema/detalleVenta';
import { Model, PipelineStage, Types } from 'mongoose';
import { Venta } from '../schema/venta.schema';
import { StockService } from 'src/stock/stock.service';
import { BuscadorVentaDto } from '../dto/BuscadorVenta.dto';
import { Type } from 'class-transformer';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { FlagVentaE } from '../enum/ventaEnum';
import { CotizacionService } from 'src/cotizacion/cotizacion.service';
import { filtradorVenta } from '../utils/filtroVenta';

@Injectable()
export class VentaProductoService {
  constructor(
    @InjectModel(Venta.name)
    private readonly venta: Model<Venta>,
    @InjectModel(DetalleVenta.name)
    private readonly detalleVenta: Model<DetalleVenta>,
    private readonly stockService: StockService,
    private readonly sucursalService: SucursalService,
    private readonly cotizacionService: CotizacionService,
  ) {}
  async reporteVentaProductosUnidad(
    buscadorVentaDto: BuscadorVentaDto,
    actual: boolean,
  ) {
    // Validaciones
    if (!buscadorVentaDto.rubro || buscadorVentaDto.rubro.length === 0) {
      throw new BadRequestException('Ingrese el rubro');
    }

    // Preparar filtro inicial común
    const filtroVenta = filtradorVenta(buscadorVentaDto)


    const resultados = await Promise.all(
      buscadorVentaDto.sucursal.map(async (sucursalId) => {
        const sucursalObjectId = new Types.ObjectId(sucursalId);
        const pipeline: PipelineStage[] = [
          {
            $match: {
              ...filtroVenta,
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
            $unwind: {
              path: '$detalleVenta',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $match: {
              'detalleVenta.rubro': { $in: buscadorVentaDto.rubro },
            },
          },
          {
            $lookup: {
              from: 'Producto',
              localField: 'detalleVenta.producto',
              foreignField: '_id',
              as: 'producto',
            },
          },
          { $unwind: '$producto' },
          {
            $lookup: {
              from: 'Marca',
              localField: 'producto.marca',
              foreignField: '_id',
              as: 'marca',
            },
          },
          { $unwind: '$marca' },
          {
            $project: {
              rubro: '$detalleVenta.rubro',
              cantidad: '$detalleVenta.cantidad',
              'producto._id': 1,
              'marca.nombre': 1,
              'marca.categoria': 1,
            },
          },
          {
            $group: {
              _id: {
                marca: '$marca.nombre',
                rubro: '$rubro',
                categoria: '$marca.categoria',
              },
              productos: { $addToSet: '$producto._id' },
              cantidadVentas: { $sum: '$cantidad' },
            },
          },
          {
            $project: {
              _id: 0,
              categoria: '$_id.categoria',
              marca: '$_id.marca',
              rubro: '$_id.rubro',
              productos: 1,
              cantidadVentas: 1,
            },
          },
        ];
        const [sucursalInfo, ventasAgrupadas] = await Promise.all([
          this.sucursalService.listarSucursalId(sucursalId),
          this.venta.aggregate(pipeline),
        ]);

        let productosFinales: any[] = [];

        if (actual) {
          productosFinales = await Promise.all(
            ventasAgrupadas.map(async (item) => {
              const [stock, cot] = await Promise.all([
                this.stockService.buscarStockVenta(item.productos),
                this.cotizacionService.cantidadCotizaciones(
                  buscadorVentaDto.rubro,
                  item.productos,
                  buscadorVentaDto.fechaInicio,
                  buscadorVentaDto.fechaFin,
                  sucursalObjectId,
                ),
              ]);
              return {
                rubro: item.rubro,
                categoria: item.categoria,
                marca: item.marca,
                cantidadVentas: item.cantidadVentas,
                cantidadCotizaciones: cot,
                stock,
              };
            }),
          );
        } else {
          productosFinales = ventasAgrupadas;
        }

        return {
          sucursal: sucursalInfo?.nombre,
          empresa: sucursalInfo?.empresa,
          productos: productosFinales,
        };
      }),
    );

    return resultados;
  }


   
}

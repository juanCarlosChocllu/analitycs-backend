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
import { DetalleVentaDto } from '../dto/DetalleVenta.dto';
import { filter } from 'rxjs';
import { detallleVentaFilter } from '../utils/detalleVenta.util';
import { FacingService } from 'src/facing/facing.service';
import pMap from 'p-map';

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
    private readonly facingService: FacingService,
  ) {}

  async reporteVentaProductosUnidad(
    buscadorVentaDto: BuscadorVentaDto,
    actual: boolean,
  ) {
    if (!buscadorVentaDto.rubro || buscadorVentaDto.rubro.length === 0) {
      throw new BadRequestException('Ingrese el rubro');
    }
    const CONCURRENCY_SUCURSALES = 10;
    const CONCURRENCY_PRODUCTOS = 20;

    const filtroVenta = filtradorVenta(buscadorVentaDto);

    const resultados = await pMap(
      buscadorVentaDto.sucursal,
      async (sucursalId) => {
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
              marcaId: '$marca._id',
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
              marcaId: { $first: '$marcaId' },
            },
          },
          {
            $project: {
              _id: 0,
              marcaId: 1,
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
          this.venta.aggregate(pipeline, { allowDiskUse: true }),
        ]);
        let productosFinales: any[] = [];
        if (actual) {
          productosFinales = await pMap(
            ventasAgrupadas,
            async (item) => {
              const [stock, facing] = await Promise.all([
                this.stockService.buscarStockVenta(
                  item.productos,
                  buscadorVentaDto.fechaInicio,
                  buscadorVentaDto.fechaFin,
                ),
                this.facingService.cantidadDeFacing(
                  item.marcaId,
                  sucursalId,
                  buscadorVentaDto.fechaInicio,
                  buscadorVentaDto.fechaFin,
                ),
              ]);
             
              return {
                rubro: item.rubro,
                categoria: item.categoria,
                marca: item.marca,
                cantidadVentas: item.cantidadVentas,
                presupuesto: 0,
                facing,
                stock,
              };
            },
            { concurrency: CONCURRENCY_PRODUCTOS },
          );
        } else {
          productosFinales = ventasAgrupadas;
        }

        return {
          sucursal: sucursalInfo?.nombre,
          empresa: sucursalInfo?.empresa,
          productos: productosFinales,
        };
      },
      { concurrency: CONCURRENCY_SUCURSALES },
    );
    return resultados;
  }

  async kipProductos(kpiDto: BuscadorVentaDto) {
    const filtrador = filtradorVenta(kpiDto);

    const dataMonturas: any = [];
    for (let su of kpiDto.sucursal) {
      const productos = await this.venta.aggregate([
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
          $unwind: { path: '$sucursal', preserveNullAndEmptyArrays: false },
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
            'detalleVenta.rubro': { $in: kpiDto.rubro },
          },
        },

        {
          $lookup: {
            from: 'Producto',
            foreignField: '_id',
            localField: 'detalleVenta.producto',
            as: 'Producto',
          },
        },
        {
          $lookup: {
            from: 'Marca',
            foreignField: '_id',
            localField: 'Producto.marca',
            as: 'marca',
          },
        },
        {
          $unwind: { path: '$marca', preserveNullAndEmptyArrays: false },
        },

        {
          $group: {
            _id: {
              rubro: '$detalleVenta.rubro',
              sucursal: '$sucursal._id',
            },
            cantidad: { $sum: '$detalleVenta.cantidad' },
            sucursal: { $first: '$sucursal.nombre' },
            rubro: { $first: '$detalleVenta.rubro' },
            idSucursal: { $first: '$sucursal._id' },
          },
        },
        {
          $project: {
            _id: 0,
            sucursal: 1,
            cantidad: 1,
            idSucursal: 1,
            rubro: 1,
          },
        },
      ]);

      dataMonturas.push(...productos);
    }
    return dataMonturas;
  }

  async detalleProductoKpi(
    detalleProducto: DetalleVentaDto,
    sucursal: Types.ObjectId,
    rubro: string,
  ) {
    const filter = detallleVentaFilter(detalleProducto);

    const productos = await this.venta.aggregate([
      {
        $match: {
          ...filter,
          sucursal: new Types.ObjectId(sucursal),
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
          'detalleVenta.rubro': rubro,
        },
      },
      {
        $lookup: {
          from: 'Producto',
          foreignField: '_id',
          localField: 'detalleVenta.producto',
          as: 'Producto',
        },
      },
      {
        $lookup: {
          from: 'Marca',
          foreignField: '_id',
          localField: 'Producto.marca',
          as: 'marca',
        },
      },
      {
        $unwind: { path: '$marca', preserveNullAndEmptyArrays: false },
      },

      {
        $group: {
          _id: '$marca.nombre',
          cantidad: { $sum: '$detalleVenta.cantidad' },
          rubro: { $first: '$detalleVenta.rubro' },
        },
      },
      {
        $project: {
          _id: 0,
          marca: '$_id',
          cantidad: 1,
          rubro: 1,
        },
      },
    ]);

    return productos;
  }
}

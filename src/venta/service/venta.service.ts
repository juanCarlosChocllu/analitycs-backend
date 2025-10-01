import { HttpStatus, Injectable } from '@nestjs/common';
import { Venta } from '../schema/venta.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  CodigoMiaProductoI,
  FiltroVentaI,
  VentaI,
  VentaIOpcional,
} from '../interface/venta';
import { DetalleVenta } from '../schema/detalleVenta';
import { detalleVentaI } from '../interface/detalleVenta';
import { DescargarProviderDto } from 'src/providers/dto/DescargarProviderDto';
import {
  diasHAbiles,
  formaterFechaHora,
  horaUtc,
  ticketPromedio,
} from 'src/core-app/utils/coreAppUtils';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { BuscadorVentaDto } from '../dto/BuscadorVenta.dto';
import { filtradorVenta } from '../utils/filtroVenta';
import { FlagVentaE } from '../enum/ventaEnum';
import { AsesorService } from 'src/asesor/asesor.service';
import { AnularVentaI, FinalizarVentaMia } from 'src/providers/interface/ApiMia';

@Injectable()
export class VentaService {
  constructor(
    @InjectModel(Venta.name)
    private readonly venta: Model<Venta>,
    @InjectModel(DetalleVenta.name)
    private readonly detalleVenta: Model<DetalleVenta>,
    private readonly sucursalService: SucursalService,
    private readonly asesorService: AsesorService,
  ) {}

    async anularVenta(anularVentaDto: AnularVentaI) {
    const venta = await this.venta.findOne({
      id_venta: anularVentaDto.id_venta,
    });
    if (venta) {
      await this.venta.updateOne(
        { id_venta: anularVentaDto.id_venta },
        {
          fechaAnulacion: horaUtc(anularVentaDto.fechaAnulacion),
          estadoTracking: anularVentaDto.estadoTracking,
          estado: anularVentaDto.estado,
        },
      );
      return { status: HttpStatus.OK };
    }
  }

    async finalizarVentasCron(FinalizarVentaMia: FinalizarVentaMia) {
    const venta = await this.venta.findOne({
      id_venta: FinalizarVentaMia.id_venta.toUpperCase(),
    });
    if (venta) {
      await this.venta.updateOne(
        { id_venta: FinalizarVentaMia.id_venta.toUpperCase().trim() },
        {
          fechaFinalizacion: horaUtc(FinalizarVentaMia.fecha_finalizacion),
          estadoTracking: FinalizarVentaMia.estadoTracking,
          flagVenta: FinalizarVentaMia.flaVenta,
          estado: FinalizarVentaMia.estado,
        },
      );
    } else {
      console.log('Ventas no encontradas', FinalizarVentaMia.id_venta);
    }
  }


  async guardarVenta(ventaData: VentaIOpcional) {
    const venta = await this.venta.findOne({ id_venta: ventaData.id_venta });
    if (!venta) {
      return this.venta.create(ventaData);
    }
    return venta;
  }

  async guardarDetalleVenta(data: detalleVentaI) {
    const detalle = await this.detalleVenta.findOne({
      rubro: data.rubro,
      venta: data.venta,
    });
    if (!detalle) {
      return this.detalleVenta.create(data);
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

  public async indicadoresPorSucursal(VentaTodasDto: BuscadorVentaDto) {
    const filtrador = filtradorVenta(VentaTodasDto);

    const dataDiaria = await this.ventasSucursalDiaria(
      VentaTodasDto.sucursal,
      filtrador,
      VentaTodasDto.flagVenta,
    );

    let dias: number = diasHAbiles(
      VentaTodasDto.fechaInicio,
      VentaTodasDto.fechaFin,
    );
    dias <= 0 ? (dias = 1) : dias;

    const data = {
      sucursales: 0,
      totalVentas: 0,
      tcPromedio: 0,
      ventaDiariaPorLocal: 0,
      unidadPorTickect: 0,
      ticketPromedio: 0,
      tasaConversion: 0,
    };
    const dataSucursal = await Promise.all(
      VentaTodasDto.sucursal.map((id) =>
        this.idicadorSucursal(new Types.ObjectId(id), filtrador),
      ),
    );

    const traficoCliente = dataSucursal.reduce(
      (total, item) => total + item.traficoCliente,
      0,
    );
    const cantidad = dataSucursal.reduce(
      (total, item) => total + item.cantidad,
      0,
    );
    const ticket = dataSucursal.reduce(
      (total, item) => total + item.totalTicket,
      0,
    );
    const totalVenta = dataSucursal.reduce(
      (total, item) => total + item.ventaTotal,
      0,
    );
    data.sucursales = VentaTodasDto.sucursal.length;
    data.totalVentas = totalVenta;

    data.unidadPorTickect = parseFloat((cantidad / ticket).toFixed(2))
      ? parseFloat((cantidad / ticket).toFixed(2))
      : 0;
    data.ventaDiariaPorLocal = parseFloat((totalVenta / dias).toFixed(2));

    data.ticketPromedio = ticketPromedio(totalVenta, cantidad);

    data.tcPromedio =
      (traficoCliente / ticket) * 100 ? (traficoCliente / ticket) * 100 : 0;
    const resultado = {
      ...data,
      dataSucursal,
      dataDiaria,
    };
    return resultado;
  }

  private async idicadorSucursal(
    idsucursal: Types.ObjectId,
    filtrador: FiltroVentaI,
  ) {
    const pipline: PipelineStage[] = [
      {
        $match: {
          sucursal: new Types.ObjectId(idsucursal),
          ...filtrador,
        },
      },
      {
        $lookup: {
          from: 'DetalleVenta',
          foreignField: 'venta',
          localField: '_id',
          as: 'detalleventa',
        },
      },

      {
        $group: {
          _id: '$sucursal',
          ventaTotal: {
            $sum: '$montoTotalDescuento',
          },
          totalTicket: {
            $sum: 1,
          },
          traficoCliente: {
            $sum: 0,
          },
          totalImporte: { $sum: '$montoTotal' },
          cantidad: {
            $sum: {
              $sum: {
                $map: {
                  input: '$detalleventa',
                  as: 'item',
                  in: { $ifNull: ['$$item.cantidad', 0] },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          ventaTotal: 1,
          totalTicket: 1,
          traficoCliente: 1,
          totalImporte: 1,
          cantidad: 1,

          ticketPromedio: {
            $cond: {
              if: { $ne: ['$totalTicket', 0] },
              then: {
                $round: [{ $divide: ['$ventaTotal', '$totalTicket'] }, 2],
              },
              else: 0,
            },
          },
          unidadPorTicket: {
            $cond: {
              if: { $ne: ['$cantidad', 0] },
              then: {
                $round: [{ $divide: ['$cantidad', '$totalTicket'] }, 2],
              },
              else: 0,
            },
          },

          precioPromedio: {
            $cond: {
              if: { $ne: ['$ventaTotal', 0] },
              then: {
                $round: [{ $divide: ['$ventaTotal', '$cantidad'] }, 2],
              },
              else: 0,
            },
          },

          tasaConversion: {
            $cond: {
              if: { $ne: ['$traficoCliente', 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$totalTicket', '$traficoCliente'] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              else: 0,
            },
          },
        },
      },
    ];
    const [sucursal, sucusarsalData] = await Promise.all([
      this.sucursalService.listarSucursalId(idsucursal),
      this.venta.aggregate(pipline),
    ]);

    const resultadoFinal =
      sucusarsalData.length > 0
        ? sucusarsalData[0]
        : {
            _id: null,
            traficoCliente: 0,
            ventaTotal: 0,
            totalTicket: 0,
            cantidad: 0,
            ticketPromedio: 0,
            unidadPorTicket: 0,
            precioPromedio: 0,
            totalImporte: 0,
          };

    const data = {
      sucursal: sucursal.nombre,
      id: sucursal._id,
      ...resultadoFinal,
    };

    return data;
  }

  private async ventasSucursalDiaria(
    sucursales: Types.ObjectId[],
    filtrador: FiltroVentaI,
    flagVenta: string,
  ) {
    const agrupacion =
      flagVenta === FlagVentaE.finalizadas
        ? {
            aqo: { $year: '$fechaFinalizacion' },
            mes: { $month: '$fechaFinalizacion' },
            dia: { $dayOfMonth: '$fechaFinalizacion' },
          }
        : {
            aqo: { $year: '$fechaVenta' },
            mes: { $month: '$fechaVenta' },
            dia: { $dayOfMonth: '$fechaVenta' },
          };

    const ventas = await this.venta.aggregate([
      {
        $match: {
          sucursal: {
            $in: sucursales.map((id) => new Types.ObjectId(id)),
          },
          ...filtrador,
        },
      },
      {
        $lookup: {
          from: 'DetalleVenta',
          foreignField: 'venta',
          localField: '_id',
          as: 'detalleventa',
        },
      },

      {
        $group: {
          _id: {
            ...agrupacion,
          },
          cantidad: {
            $sum: {
              $sum: {
                $map: {
                  input: '$detalleventa',
                  as: 'item',
                  in: { $ifNull: ['$$item.cantidad', 0] },
                },
              },
            },
          },
          tickets: {
            $sum: 1,
          },

          ventaTotal: {
            $sum: '$montoTotalDescuento',
          },

          importe: {
            $sum: '$montoTotal',
          },
        },
      },
      {
        $project: {
          _id: 0,
          fecha: {
            $concat: [
              { $toString: '$_id.aqo' },
              '-',
              { $toString: '$_id.mes' },
              '-',
              { $toString: '$_id.dia' },
            ],
          },
          cantidad: 1,
          tickets: 1,
          ventaTotal: 1,
          importe: 1,
          ticketPromedio: {
            $cond: {
              if: { $ne: ['$tickets', 0] },
              then: {
                $round: [{ $divide: ['$ventaTotal', '$tickets'] }, 2],
              },
              else: 0,
            },
          },

          unidadPorTicket: {
            $cond: {
              if: { $ne: ['$cantidad', 0] },
              then: {
                $round: [{ $divide: ['$cantidad', '$tickets'] }, 2],
              },
              else: 0,
            },
          },
          precioPromedio: {
            $cond: {
              if: { $ne: ['$ventaTotal', 0] },
              then: {
                $round: [{ $divide: ['$ventaTotal', '$cantidad'] }, 2],
              },
              else: 0,
            },
          },
        },
      },
    ]);

    return ventas;
  }

  public async indicadoresPorAsesor(VentaTodasDto: BuscadorVentaDto) {
    const ventaPorAsesor = await this.ventaPorAsesores(VentaTodasDto);
    return ventaPorAsesor;
  }

  private async ventaPorAsesores(ventaTodasDto: BuscadorVentaDto) {
    const filtrador = filtradorVenta(ventaTodasDto);

    const asesores = (
      await Promise.all(
        ventaTodasDto.sucursal.map((item) =>
          this.asesorService.listarAsesorPorSucursal(item),
        ),
      )
    ).flat();

    const venPorAsesor: any[] = [];

    for (let asesor of asesores) {
      const pipline: PipelineStage[] = [
        {
          $match: {
            detalleAsesor: new Types.ObjectId(asesor._id),
            ...filtrador,
          },
        },
        {
          $lookup: {
            from: 'DetalleVenta',
            foreignField: 'venta',
            localField: '_id',
            as: 'detalleventa',
          },
        },
        {
          $group: {
            _id: null,
            ventaTotal: {
              $sum: '$montoTotalDescuento',
            },
            totalTicket: {
              $sum: 1,
            },
            cantidad: {
              $sum: {
                $sum: {
                  $map: {
                    input: '$detalleventa',
                    as: 'item',
                    in: { $ifNull: ['$$item.cantidad', 0] },
                  },
                },
              },
            },
            totalImporte: { $sum: '$montoTotal' },
          },
        },
        {
          $project: {
            ventaTotal: 1,
            cantidad: 1,
            totalTicket: 1,
            importeTotalSuma: '$totalImporte',

            ticketPromedio: {
              $cond: {
                if: { $ne: ['$totalTicket', 0] },
                then: {
                  $round: [{ $divide: ['$ventaTotal', '$totalTicket'] }, 2],
                },
                else: 0,
              },
            },

            precioPromedio: {
              $cond: {
                if: { $ne: ['$cantidad', 0] },
                then: {
                  $round: [{ $divide: ['$ventaTotal', '$cantidad'] }, 2],
                },
                else: 0,
              },
            },
            unidadPorTicket: {
              $cond: {
                if: { $ne: ['$cantidad', 0] },
                then: {
                  $round: [{ $divide: ['$cantidad', '$totalTicket'] }, 2],
                },
                else: 0,
              },
            },
          },
        },
      ];

      const [sucursal, resultado] = await Promise.all([
        this.sucursalService.buscarSucursalPorId(asesor.idSucursal),

        this.venta.aggregate(pipline),
      ]);
      
      
      const resultadoFinal =
        resultado.length > 0
          ? resultado[0]
          : {
              _id: null,
              unidadPorTicket: 0,
              importeTotalSuma: 0,
              ventaTotal: 0,
              cantidad: 0,
              totalTicket: 0,
              ticketPromedio: 0,
              precioPromedio: 0,
            };

      const data = {
        sucursal: sucursal?.nombre,
        asesor: asesor.nombre,
        ...resultadoFinal,
      };
      console.log(data);
      
      venPorAsesor.push(data);
    }

    return venPorAsesor;
  }

  ///comparativos

  async ventas(ventaTodasDto: BuscadorVentaDto) {
    const [venta, ventaSucursal, dataDiaria] = await Promise.all([
      this.ventaEmpresa(ventaTodasDto),
      this.ventaSucursal(ventaTodasDto),
      this.ventaSucursalDiaria(ventaTodasDto),
    ]);
    const total = venta.reduce((total, ve) => total + ve.importe, 0);
    const cantidad = venta.reduce((total, ve) => total + ve.cantidad, 0);
    const tktPromedio = ticketPromedio(total, cantidad);
    const resultado = {
      cantidadSucursal: ventaSucursal.ventaSucursal.length,
      fechaInicio: ventaTodasDto.fechaInicio,
      fechaFin: ventaTodasDto.fechaFin,
      total,
      cantidad,
      tktPromedio,
      venta,
      ventaSucursal,
      dataDiaria,
    };

    return resultado;
  }

  private async ventaEmpresa(ventaTodasDto: BuscadorVentaDto) {
    const filtrador: FiltroVentaI = filtradorVenta(ventaTodasDto);

    const venta = await this.venta.aggregate([
      {
        $match: {
          ...filtrador,
          sucursal: {
            $in: ventaTodasDto.sucursal.map((id) => new Types.ObjectId(id)),
          },
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
        $unwind: '$detalleVenta',
      },
      {
        $group: {
          _id: '$detalleVenta.rubro',
          cantidad: { $sum: '$detalleVenta.cantidad' },
          importe: { $sum: '$detalleVenta.importe' },
        },
      },
      {
        $project: {
          _id: 0,
          producto: '$_id',
          cantidad: 1,
          importe: 1,
          montoTotal: 1,
          descuento: 1,
          ventas: 1,
        },
      },
    ]);

    return venta;
  }

  private async ventaSucursalDiaria(ventaTodasDto: BuscadorVentaDto) {
    const filtrador: FiltroVentaI = filtradorVenta(ventaTodasDto);

    const agrupacion =
      ventaTodasDto.flagVenta === FlagVentaE.finalizadas
        ? {
            aqo: { $year: '$fechaFinalizacion' },
            mes: { $month: '$fechaFinalizacion' },
            dia: { $dayOfMonth: '$fechaFinalizacion' },
          }
        : {
            aqo: { $year: '$fechaVenta' },
            mes: { $month: '$fechaVenta' },
            dia: { $dayOfMonth: '$fechaVenta' },
          };
    const venta = await this.venta.aggregate([
      {
        $match: {
          ...filtrador,
          sucursal: {
            $in: ventaTodasDto.sucursal.map((id) => new Types.ObjectId(id)),
          },
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
        $unwind: '$detalleVenta',
      },

      {
        $group: {
          _id: {
            producto: '$detalleVenta.rubro',
            ...agrupacion,
          },
          cantidad: { $sum: '$detalleVenta.cantidad' },
          importe: { $sum: '$detalleVenta.importe' },
          ventas: { $addToSet: '$_id' },
        },
      },
      {
        $addFields: {
          ticket: { $size: '$ventas' },
        },
      },
      {
        $project: {
          _id: 0,
          producto: '$_id.producto',
          cantidad: 1,
          ticket: 1,
          importe: 1,

          descuento: 1,
          ventas: 1,
          ticketPromedio: {
            $cond: {
              if: { $ne: ['$ticket', 0] },
              then: {
                $round: [{ $divide: ['$importe', '$ticket'] }, 2],
              },
              else: 0,
            },
          },
          precioPromedio: {
            $cond: {
              if: { $ne: ['$importe', 0] },
              then: {
                $round: [{ $divide: ['$importe', '$cantidad'] }, 2],
              },
              else: 0,
            },
          },
          fecha: {
            $concat: [
              { $toString: '$_id.aqo' },
              '-',
              { $toString: '$_id.mes' },
              '-',
              { $toString: '$_id.dia' },
            ],
          },
        },
      },
    ]);
    return venta;
  }

  private async ventaSucursal(ventaTodasDto: BuscadorVentaDto) {
    const sucursales: Types.ObjectId[] = [];
    const ventaSucursal: any[] = [];
    const filtrador: FiltroVentaI = filtradorVenta(ventaTodasDto);

    for (let sucursal of ventaTodasDto.sucursal) {
      const pipeline: PipelineStage[] = [
        {
          $match: {
            sucursal: new Types.ObjectId(sucursal),
            ...filtrador,
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
          $unwind: '$sucursal',
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
          $unwind: '$detalleVenta',
        },
        {
          $group: {
            _id: '$detalleVenta.rubro',
            cantidad: { $sum: '$detalleVenta.cantidad' },
            montoTotal: {
              $sum: '$detalleVenta.importe',
            },
          },
        },
        {
          $project: {
            _id: 0,
            producto: '$_id',
            sucursal: '$_id.sucursal',
            cantidad: 1,
            montoTotal: 1,
          },
        },
      ];
      const [venta, s] = await Promise.all([
        this.venta.aggregate(pipeline),
        this.sucursalService.buscarSucursalPorId(sucursal),
      ]);

      const resultado = {
        sucursal: s?.nombre,
        data: venta,
      };

      ventaSucursal.push(resultado);
    }

    const data = this.calcularDatosSucursal(ventaSucursal, ventaTodasDto);
    const resultado = {
      data,
      ventaSucursal,
      cantidadSucursal: sucursales.length,
    };


    return resultado;
  }

  private calcularDatosSucursal(
    ventaPorSucursal: any[],
    ventaTodasDto: BuscadorVentaDto,
  ) {
    const dias = diasHAbiles(ventaTodasDto.fechaInicio, ventaTodasDto.fechaFin);

    const totalVenta: number[] = [];
    const cantidadTotal: number[] = [];
    for (let venta of ventaPorSucursal) {
      cantidadTotal.push(this.cantidadTotal(venta.data));
      totalVenta.push(this.total(venta.data));
    }

    const total = totalVenta
      .reduce((total, venta) => total + venta, 0)
      .toFixed(2);
    const cantidad = cantidadTotal.reduce(
      (total, cantidad) => total + cantidad,
      0,
    );

    
    const tktPromedio = ticketPromedio(parseFloat(total), cantidad);

    
    const ventaPorDia = parseFloat((parseFloat(total) / dias).toFixed(2));

    const resultado = {
      total,
      cantidad,
      ventaPorDia,
      ticketPromedio:tktPromedio,
    };
    return resultado;
  }
  private cantidadTotal(venta: any[]) {
    const cantidad = venta.reduce(
      (total: number, venta) => total + venta.cantidad,
      0,
    );
    return cantidad;
  }
  private total(venta: any[]) {
    const total = venta.reduce(
      (total: number, venta) => total + venta.montoTotal,
      0,
    );

    return total;
  }
}

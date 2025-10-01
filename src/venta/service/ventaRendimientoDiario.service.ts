import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Venta } from '../schema/venta.schema';
import { DetalleVenta } from '../schema/detalleVenta';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import {
  resultadRendimientoDiarioI,
  ventaAsesorI,
  ventaAvanceLocalI,
  VentaRendimientoDiarioI,
} from '../interface/venta';
import { BuscadorRendimientoDiarioDto } from 'src/rendimiento-diario/dto/BuscardorRendimientoDiario';
import { filtradorVenta } from '../utils/filtroVenta';
import { FlagVentaE } from '../enum/ventaEnum';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { MetasSucursalService } from 'src/metas-sucursal/services/metas-sucursal.service';
import { AsesorService } from 'src/asesor/asesor.service';
import { RendimientoDiarioService } from 'src/rendimiento-diario/rendimiento-diario.service';
import { CotizacionService } from 'src/cotizacion/cotizacion.service';

@Injectable()
export class VentaRendimientoDiarioService {
  constructor(
    @InjectModel(Venta.name)
    private readonly venta: Model<Venta>,
    @InjectModel(DetalleVenta.name)
    private readonly detalleVenta: Model<DetalleVenta>,
    private readonly sucursalService: SucursalService,
    private readonly metasSucursalService: MetasSucursalService,
    private readonly asesorService: AsesorService,
    private readonly rendimientoDiarioService: RendimientoDiarioService,
    private readonly cotizacionService: CotizacionService,
  ) {}

  async ventasParaRendimientoDiario(
    buscadorRendimientoDiarioDto: BuscadorRendimientoDiarioDto,
  ): Promise<resultadRendimientoDiarioI[]> {
    const filter = filtradorVenta(buscadorRendimientoDiarioDto);
    let agrupacion = {};
    if (buscadorRendimientoDiarioDto.flagVenta == FlagVentaE.realizadas) {
      agrupacion = {
        aqo: { $year: '$fechaVenta' },
        mes: { $month: '$fechaVenta' },
        dia: { $dayOfMonth: '$fechaVenta' },
      };
    } else {
      agrupacion = {
        aqo: { $year: '$fechaFinalizacion' },
        mes: { $month: '$fechaFinalizacion' },
        dia: { $dayOfMonth: '$fechaFinalizacion' },
      };
    }

    const dataVenta: resultadRendimientoDiarioI[] = await Promise.all(
      buscadorRendimientoDiarioDto.sucursal.map(async (item) => {
        const [sucursal, metas, asesor] = await Promise.all([
          this.sucursalService.buscarSucursalPorId(item),
          this.metasSucursalService.listarMetasPorSucursal(
            item,
            buscadorRendimientoDiarioDto.fechaInicio,
          ),
          this.asesorService.listarAsesorPorSucursal(item),
        ]);

        const ventaAsesor = await Promise.all(
          asesor.map(async (item) => {
            const ventas: VentaRendimientoDiarioI[] =
              await this.venta.aggregate([
                {
                  $match: {
                    detalleAsesor: new Types.ObjectId(item._id),
                    ...filter,
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
                  $group: {
                    _id: agrupacion,
                    lente: {
                      $sum: {
                        $cond: {
                          if: { $eq: ['$detalleVenta.rubro', 'LENTE'] },
                          then: '$detalleVenta.cantidad',
                          else: 0,
                        },
                      },
                    },
                    lc: {
                      $sum: {
                        $cond: {
                          if: {
                            $eq: ['$detalleVenta.rubro', 'LENTE DE CONTACTO'],
                          },
                          then: '$detalleVenta.cantidad',
                          else: 0,
                        },
                      },
                    },
                    entregadas: {
                      $sum: {
                        $cond: {
                          if: { $eq: ['$flag', 'FINALIZADO'] },
                          then: 1,
                          else: 0,
                        },
                      },
                    },

                    receta: {
                      $push: {
                        $cond: {
                          if: { $eq: ['$detalleVenta.rubro', 'LENTE'] },
                          then: {
                            descripcion: '$detalleVenta.descripcion',
                          },
                          else: '$$REMOVE',
                        },
                      },
                    },
                    montoTotal: { $sum: '$montoTotal' },
                    ticket: { $sum: 1 },
                    asesorId: { $first: '$asesor' },
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

                    receta: 1,
                    montoTotal: 1,
                    lente: 1,
                    lc: 1,
                    entregadas: 1,
                    asesorId: 1,
                    ticket: 1,
                  },
                },
                {
                  $sort: { fechaVenta: -1 },
                },
              ]);
            if (ventas.length === 0) {
              return null;
            }
            const resultado: ventaAsesorI = {
              asesor: item.nombre,
              ventas: ventas,
            };

            return resultado;
          }),
        );
        const ventaAsesorFiltrado = ventaAsesor.filter(
          (asesor) => asesor !== null,
        );
        const resultado: resultadRendimientoDiarioI = {
          metaTicket: metas ? metas.ticket : 0,
          diasComerciales: metas ? metas.dias : 0,
          sucursal: sucursal ? sucursal.nombre : 'Sin sucursal',
          metaMonto: metas ? metas.monto : 0,
          ventaAsesor: ventaAsesorFiltrado,
        };
        return resultado;
      }),
    );

    return dataVenta;
  }

  /*async ventasParaRendimientoDiarioAsesor(
    request: Request,
  ): Promise<VentaRendimientoDiarioI[]> {
    const ventas = await this.venta.aggregate([
      {
        $match: {
          asesor: new Types.ObjectId(request.usuario.detalleAsesor),
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
        $lookup: {
          from: 'Asesor',
          foreignField: '_id',
          localField: 'asesor',
          as: 'asesor',
        },
      },
      {
        $group: {
          _id: {
            aqo: { $year: '$fechaVenta' },
            mes: { $month: '$fechaVenta' },
            dia: { $dayOfMonth: '$fechaVenta' },
          },
          lente: {
            $sum: {
              $cond: {
                if: { $eq: ['$detalleVenta.rubro', 'LENTE'] },
                then: '$detalleVenta.cantidad',
                else: 0,
              },
            },
          },
          lc: {
            $sum: {
              $cond: {
                if: { $eq: ['$detalleVenta.rubro', 'LENTE DE CONTACTO'] },
                then: '$detalleVenta.cantidad',
                else: 0,
              },
            },
          },
          entregadas: {
            $sum: {
              $cond: {
                if: { $eq: ['$flag', 'FINALIZADO'] },
                then: 1,
                else: 0,
              },
            },
          },

          receta: {
            $push: {
              $cond: {
                if: { $eq: ['$detalleVenta.rubro', 'LENTE'] },
                then: {
                  descripcion: '$detalleVenta.descripcion',
                },
                else: '$$REMOVE',
              },
            },
          },
          montoTotal: { $sum: '$montoTotal' },
          ticket: { $sum: 1 },
          asesorId: { $first: { $arrayElemAt: ['$asesor._id', 0] } },
          asesor: { $first: { $arrayElemAt: ['$asesor.nombre', 0] } },
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
          asesor: 1,
          receta: 1,
          montoTotal: 1,
          lente: 1,
          lc: 1,
          entregadas: 1,
          asesorId: 1,
          ticket: 1,
        },
      },
      {
        $sort: { fechaVenta: -1 },
      },
    ]);

    return ventas;
  }*/

  async ventaMentaPorAsesor(
    buscadorRendimientoDiarioDto: BuscadorRendimientoDiarioDto,
  ) {
    const filter = filtradorVenta(buscadorRendimientoDiarioDto);
    console.log(buscadorRendimientoDiarioDto);

    let agrupacion = {};
    if (buscadorRendimientoDiarioDto.flagVenta == FlagVentaE.realizadas) {
      agrupacion = {
        aqo: { $year: '$fechaVenta' },
        mes: { $month: '$fechaVenta' },
        dia: { $dayOfMonth: '$fechaVenta' },
      };
    } else {
      agrupacion = {
        aqo: { $year: '$fechaFinalizacion' },
        mes: { $month: '$fechaFinalizacion' },
        dia: { $dayOfMonth: '$fechaFinalizacion' },
      };
    }

    const dataVenta = await Promise.all(
      buscadorRendimientoDiarioDto.sucursal.map(async (item) => {
        const [sucursal, metas, asesor] = await Promise.all([
          this.sucursalService.buscarSucursalPorId(item),
          this.metasSucursalService.listarMetasPorSucursal(
            item,
            buscadorRendimientoDiarioDto.fechaInicio,
          ),
          this.asesorService.listarAsesorPorSucursal(item),
        ]);

        const ventaAsesor = await Promise.all(
          asesor.map(async (item) => {
            const venta = await this.venta.aggregate([
              {
                $match: {
                  detalleAsesor: new Types.ObjectId(item._id),
                  ...filter,
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
                $group: {
                  _id: agrupacion,

                  montoTotal: { $sum: '$montoTotal' },
                  ticket: { $sum: 1 },

                  dias: { $sum: 1 },
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

                  montoTotal: 1,

                  ticket: 1,
                  dias: 1,
                },
              },
              {
                $sort: { fechaVenta: -1 },
              },
            ]);
            return {
              asesor: item.nombre,
              dias: Math.floor(Math.random() * 26),
              ventas: venta,
            };
          }),
        );

        const resultado = {
          metaTicket: metas ? metas.ticket : 0,
          diasComerciales: metas ? metas.dias : 0,
          sucursal: sucursal ? sucursal.nombre : 'Sin sucursal',
          ventaAsesor: ventaAsesor,
        };
        return resultado;
      }),
    );
    return dataVenta;
  }

  async avanceLocal(
    buscadorRendimientoDiarioDto: BuscadorRendimientoDiarioDto,
  ) {
    const filter = filtradorVenta(buscadorRendimientoDiarioDto);
    let agrupacion = {};
    
    if (buscadorRendimientoDiarioDto.flagVenta == FlagVentaE.realizadas) {
      agrupacion = {
        aqo: { $year: '$fechaVenta' },
        mes: { $month: '$fechaVenta' },
        dia: { $dayOfMonth: '$fechaVenta' },
      };
    } else {
      agrupacion = {
        aqo: { $year: '$fechaFinalizacion' },
        mes: { $month: '$fechaFinalizacion' },
        dia: { $dayOfMonth: '$fechaFinalizacion' },
      };
    }

    
    const data = await Promise.all(
      buscadorRendimientoDiarioDto.sucursal.map(async (sucursalId) => {
        const [sucursal, metas] = await Promise.all([
          this.sucursalService.buscarSucursalPorId(sucursalId),
          this.metasSucursalService.listarMetasPorSucursal(
            sucursalId,
            buscadorRendimientoDiarioDto.fechaInicio,
          ),
        ]);
        const venta: ventaAvanceLocalI[] = await this.venta.aggregate([
          {
            $match: {
              sucursal: new Types.ObjectId(sucursalId),
              ...filter,
            },
          },

          {
            $group: {
              _id: agrupacion,
              ventasRelizadas: { $sum: 1 },
              dias: { $sum: 1 },

              asesores: { $addToSet: '$detalleAsesor' },
              ventasFinalizadas: {
                $sum: {
                  $cond: {
                    if: { $eq: ['$flagVenta', 'FINALIZADO'] },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },

          {
            $project: {
              _id: 0,
              ventasFinalizadas: 1,
              ventasRelizadas: 1,
              asesores: 1,
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
          {
            $sort: { fechaVenta: -1 },
          },
        ]);
        const data = await this.ventasFormateada(venta,sucursalId);

        return {
          sucursal: sucursal ? sucursal.nombre : 'Sin sucursal',
          metaTicket: metas ? metas.ticket : 0,
          metaMonto: metas ? metas.monto : 0,
          diasComerciales: metas ? metas.dias : 0,
          ventas: data,
        };
      }),
    );
 

    return data;
  }
  private async ventasFormateada(venta: ventaAvanceLocalI[], sucursal:Types.ObjectId) {
   
    
    return Promise.all(
      venta.map(async (item) => {
        let atenciones: number = 0;
        let presupuestos: number = 0;
        const rendimiento =
          await this.rendimientoDiarioService.listarRedimientoDiarioDia(
            item.asesores,
            item.fecha,
          );
        for (const re of rendimiento) {
          if (re.atenciones) {
            atenciones += re.atenciones;
          }
          if (re.presupuesto) {
            presupuestos += re.presupuesto;
          }
        }

        const cotizaciones = await this.cotizacionService.cantidadCotizacionesPresupuesto(item.fecha,sucursal )
        return {
          atenciones: atenciones,
          feha: item.fecha,
          presupuestos: cotizaciones ?  cotizaciones : presupuestos,
          vendidos: item.ventasRelizadas,
          entregadas: item.ventasFinalizadas,
          //asesore: item.asesores,
        };
      }),
    );
  }
}

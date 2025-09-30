import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DetalleVenta } from '../schema/detalleVenta';
import { Venta } from '../schema/venta.schema';

import { Model } from 'mongoose';
import { EmpresaService } from 'src/empresa/empresa.service';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { BuscadorVentaLenteDto } from '../dto/BuscadorVentaLente.dto';
import { EmpresaE } from '../enum/empresa.enum';
import { Types } from 'mongoose';
import { FiltroVentaI } from '../interface/venta';
import { filtradorVenta } from '../utils/filtroVenta';
import { BuscadorVentaDto } from '../dto/BuscadorVenta.dto';

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

    private readonly empresaService: EmpresaService,
    private readonly surcursalService: SucursalService,
  ) {}

  private readonly kpiPorCompania: Record<
    string,
    (dto: BuscadorVentaDto, sucursal: any[]) => Promise<any>
  > = {
    [EmpresaE.OPTICENTRO]: this.kpiOpticentroEmpresa,
    [EmpresaE.ECONOVISION]: this.kpiEconovisionEmpresa,
    [EmpresaE.TU_OPTICA]: this.kpiTuOpticaEmpresa,
    [EmpresaE.OPTISERVICE]: this.kpiOptiserviceEmpresa,
  };

  private async sucursalesPorCompania(
    empresaId: Types.ObjectId,
    sucursalIds: string[],
  ) {
    if (sucursalIds?.length) {
      const tasks = sucursalIds.map((sucursalId) =>
        this.surcursalService.listarSucursalId(new Types.ObjectId(sucursalId)),
      );
      const sucursales = await Promise.all(tasks);
      return sucursales;
    }
    return this.surcursalService.sucursalListaEmpresas(empresaId);
  }

  async kpiEmpresas(kpiEmpresaDto: BuscadorVentaLenteDto) {
    const dataEmpresas: any = [];
    console.log("kpiEmpresaDto",kpiEmpresaDto);
    for (let e of kpiEmpresaDto.empresa) {
      const sucursales: any[] = [];
      const empresa: any = await this.empresaService.buscarEmpresa(e);
      console.log(empresa);
      if (kpiEmpresaDto.sucursal.length > 0) {
        const sucursalesPromises = kpiEmpresaDto.sucursal.map((s) =>
          this.surcursalService.listarSucursalId(new Types.ObjectId(s)),
        );
        sucursales.push(...(await Promise.all(sucursalesPromises)));
      } else {
        const s = await this.surcursalService.sucursalListaEmpresas(empresa._id);
        sucursales.push(...s);
      }
      if (empresa.nombre === 'OPTICENTRO') {
        const data = await this.kpiOpticentroEmpresa(kpiEmpresaDto, sucursales);
        const resultado = {
          idEmpresa: empresa._id,
          empresa: empresa.nombre,
          data,
        };
        dataEmpresas.push(resultado);
      } else if (empresa.nombre === 'ECONOVISION') {
        const data = await this.kpiEconovisionEmpresa(
          kpiEmpresaDto,
          sucursales,
        );
        const resultado = {
          idEmpresa: empresa._id,
          empresa: empresa.nombre,
          data,
        };
        dataEmpresas.push(resultado);
      } else if (empresa.nombre === 'TU OPTICA') {
        const data = await this.kpiTuOpticaEmpresa(kpiEmpresaDto, sucursales);
        const resultado = {
          idEmpresa: empresa._id,
          empresa: empresa.nombre,
          data,
        };
        dataEmpresas.push(resultado);
      } else if (empresa.nombre === 'OPTISERVICE S.R.L') {
        const data = await this.kpiOptiserviceEmpresa(
          kpiEmpresaDto,
          sucursales,
        );
        const resultado = {
          idEmpresa: empresa._id,
          empresa: empresa.nombre,
          data,
        };
        dataEmpresas.push(resultado);
      }
    }
    return dataEmpresas;
  }

  private async kpiAntireflejo(filtrador: FiltroVentaI) {
    const pipeline = [
      {
        $match: filtrador,
      },
      {
        $lookup: {
          from: 'Tratamiento',
          foreignField: 'tratamiento',
          localField: 'tratamiento',
          as: 'tratamiento',
        },
      },
      {
        $unwind: { path: '$tratamiento', preserveNullAndEmptyArrays: false },
      },
      {
        $group: {
          _id: '$tratamiento.nombre',
          cantidad: { $sum: '$cantidad' },
        },
      },

      {
        $group: {
          _id: null,
          letes: {
            $sum: '$cantidad',
          },
          tratamientos: {
            $push: {
              tratamiento: '$_id',
              cantidad: '$cantidad',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          letes: 1,
          tratamientos: 1,
        },
      },
    ];
    const result = await this.venta.aggregate(pipeline);
    return result;
  }

  private async kpiProgresivos(filtrador: FiltroVentaI) {
    const pipeline = [
      {
        $match: filtrador,
      },
      {
        $lookup: {
          from: 'MarcaLente',
          foreignField: '_id',
          localField: 'marcaLente',
          as: 'marcaLente',
        },
      },
      {
        $lookup: {
          from: 'TipoLente',
          foreignField: '_id',
          localField: 'tipoLente',
          as: 'tipoLente',
        },
      },
      {
        $unwind: { path: '$marcaLente', preserveNullAndEmptyArrays: false },
      },
      {
        $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: false },
      },
      {
        $group: {
          _id: '$marcaLente.nombre',
          cantidad: { $sum: '$cantidad' },
        },
      },
    ];
    const progresivos = await this.venta.aggregate(pipeline);
    return progresivos;
  }

  private async kpiOcupacional(filtrador: FiltroVentaI) {
    const pipeline = [
      {
        $match: filtrador,
      },
      {
        $lookup: {
          from: 'MarcaLente',
          foreignField: '_id',
          localField: 'marcalente',
          as: 'marcaLente',
        },
      },
      {
        $lookup: {
          from: 'TipoLente',
          foreignField: '_id',
          localField: 'tipoLente',
          as: 'tipoLente',
        },
      },
      {
        $unwind: { path: '$marcaLente', preserveNullAndEmptyArrays: false },
      },
      {
        $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: false },
      },
      {
        $match: {
          'tipoLente.nombre': { $eq: 'OCUPACIONAL' },
        },
      },
      {
        $group: {
          _id: '$marcaLente.nombre',
          cantidad: { $sum: '$cantidad' },
        },
      },
    ];
    const progresivos = await this.venta.aggregate(pipeline);
    return progresivos;
  }

  public async kpiMaterial(kpiDto: BuscadorVentaDto) {
    const data: any[] = [];
    const filtrador = filtradorVenta(kpiDto);
    for (let sucursal of kpiDto.sucursal) {
      const pipeline = [
        {
          $match: {
            ...filtrador,
            sucursal: sucursal._id,
          },
        },
        {
          $lookup: {
            from: 'Material',
            foreignField: '_id',
            localField: 'material',
            as: 'material',
=======
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

          $unwind: { path: '$material', preserveNullAndEmptyArrays: false },
        },
        {
          $unwind: { path: '$sucursal', preserveNullAndEmptyArrays: false },
        },
        {
          $group: {
            _id: '$sucursal.nombre',
            cantidad: { $sum: '$cantidad' },
            sucursalNombre: { $first: '$sucursal.nombre' },
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
            sucursalNombre: '$sucursalNombre',
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
                          {
                            $divide: ['$$material.cantidad', '$lentes'],
                          },
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
      ];
      const kpiMaterial = await this.venta.aggregate(pipeline);
      const result = {
        kpiMaterial: kpiMaterial[0],
      };
      data.push(result);
    }
    return data;
  }

  private async kpiOpticentroEmpresa(
    kpiEmpresaDto: BuscadorVentaLenteDto,
    sucursales: any[],
  ) {
    const filtrador = filtradorVenta(kpiEmpresaDto);
    const sucursalesIds = sucursales.map((sucursal) => sucursal);
    console.log('filtrador', { ...filtrador, sucursal: sucursalesIds });
    const data: any[] = [];

    for (let sucursal of sucursales) {
      const pipeline = [
        {
          $match: {
            ...filtrador,
            sucursal: sucursal._id,
          },
        },
        {
          $lookup: {
            from: 'DetalleVenta',
            localField: '_id',
            foreignField: 'venta',

          $lookup: {
            from: 'DetalleVenta',
            foreignField: 'venta',
            localField: '_id',

            as: 'detalleVenta',
          },
        },
        {

          $unwind: { path: '$detalleVenta', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Producto',
            localField: 'detalleVenta.producto',
            foreignField: '_id',
            as: 'producto',
          },
        },
        {
          $unwind: { path: '$producto', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Receta',
            localField: 'detalleVenta.receta',
            foreignField: '_id',

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

          $unwind: { path: '$receta', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Tratamiento',
            localField: 'receta.tratamiento',
            foreignField: '_id',
            as: 'tratamiento',
          },
        },
        {
          $unwind: { path: '$tratamiento', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'TipoLente',
            localField: 'receta.tipoLente',
            foreignField: '_id',
            as: 'tipoLente',
          },
        },
        {
          $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: true },
        },
        // Agrupar y Calcular KPIs
        {
          $group: {
            _id: null,
            lentes: {
              $sum: {
                $cond: {
                  if: { $eq: ['$detalleVenta.rubro', 'LENTE'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            monturas: {
              $sum: {
                $cond: {
                  if: { $eq: ['$detalleVenta.rubro', 'MONTURA'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            antireflejo: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$tratamiento.nombre', 'CLARITY'] },
                      { $eq: ['$tratamiento.nombre', 'CLARITY PLUS'] },
                      { $eq: ['$tratamiento.nombre', 'BLUCLARITY'] },
                      { $eq: ['$tratamiento.nombre', 'STOP AGE'] },
                      { $eq: ['$tratamiento.nombre', 'ANTIREFLEJO'] },
                    ],
                  },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },

            progresivos: {
              $sum: {
                $cond: {
                  if: { $or: [{ $eq: ['$tipoLente.nombre', 'PROGRESIVO'] }] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            ocupacional: {
              $sum: {
                $cond: {
                  if: { $eq: ['$tipoLente.nombre', 'OCUPACIONAL'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },

            ventasSet: { $addToSet: '$_id' },
          },
        },
        {
          $project: {
            lentes: 1,
            progresivos: 1,
            monturas: 1,
            ocupacional: 1,
            ocupacionalProgresivos: 1,
            antireflejo: 1,
            tickets: { $size: '$ventasSet' },
            progresivosOcupacionales: {
              $add: ['$progresivos', '$ocupacional'],
            },
            progresivosOcupacionalesPorcentaje: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $add: ['$progresivos', '$ocupacional'] },
                            '$lentes',
                          ],
                        },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeAntireflejo: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$antireflejo', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeProgresivos: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$progresivos', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeOcupacionales: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$ocupacional', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ];

      const dataKpi = await this.venta.aggregate(pipeline);

      // CORREGIDO: Acceder correctamente a las propiedades del objeto sucursal
      const resultado = {
        sucursal: sucursal.nombre || sucursal, // Manejar caso donde sucursal sea solo el ID
        id: sucursal._id || sucursal,
        dataKpi: dataKpi[0] || {
          // Asegurar que siempre haya un objeto resultado
          lentes: 0,
          monturas: 0,
          antireflejo: 0,
          progresivos: 0,
          ocupacional: 0,
          tickets: 0,
          progresivosOcupacionales: 0,
          porcentajeAntireflejo: 0,
          porcentajeProgresivos: 0,
          porcentajeOcupacionales: 0,
          progresivosOcupacionalesPorcentaje: 0,
        },
      };

      data.push(resultado);
    }

    return data;
  }

  private async kpiEconovisionEmpresa(
    kpiEmpresaDto: BuscadorVentaLenteDto,
    sucursales: any[],
  ) {
    const filtrador = filtradorVenta(kpiEmpresaDto);
    const sucursalesIds = sucursales.map((sucursal) => sucursal);
    console.log('filtrador Econovision', { ...filtrador, sucursal: sucursalesIds });
    const data: any[] = [];

    for (let sucursal of sucursales) {
      const pipeline = [
        {
          $match: {
            ...filtrador,
            sucursal: sucursal._id,
          },
        },
        {
          $lookup: {
            from: 'DetalleVenta',
            localField: '_id',
            foreignField: 'venta',
            as: 'detalleVenta',
          },
        },
        {
          $unwind: { path: '$detalleVenta', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Producto',
            localField: 'detalleVenta.producto',
            foreignField: '_id',
            as: 'producto',
          },
        },
        {
          $unwind: { path: '$producto', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Receta',
            localField: 'detalleVenta.receta',
            foreignField: '_id',
            as: 'receta',
          },
        },
        {
          $unwind: { path: '$receta', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Tratamiento',
            localField: 'receta.tratamiento',
            foreignField: '_id',
            as: 'tratamiento',
          },
        },
        {
          $unwind: { path: '$tratamiento', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'TipoLente',
            localField: 'receta.tipoLente',
            foreignField: '_id',
            as: 'tipoLente',
          },
        },
        {
          $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'TipoColor',
            localField: 'receta.tipoColor',
            foreignField: '_id',
            as: 'tipoColor',
          },
        },
        {
          $unwind: { path: '$tipoColor', preserveNullAndEmptyArrays: true },
        },
        // Agrupar y Calcular KPIs
        {
          $group: {
            _id: null,
            lentes: {
              $sum: {
                $cond: {
                  if: { $eq: ['$detalleVenta.rubro', 'LENTE'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            monturas: {
              $sum: {
                $cond: {
                  if: { $eq: ['$detalleVenta.rubro', 'MONTURA'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            antireflejo: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$tratamiento.nombre', 'ANTIREFLEJO'] },
                      { $eq: ['$tratamiento.nombre', 'BLUE SHIELD'] },
                      { $eq: ['$tratamiento.nombre', 'GREEN SHIELD'] },
                    ],
                  },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },

            progresivos: {
              $sum: {
                $cond: {
                  if: { $or: [{ $eq: ['$tipoLente.nombre', 'PROGRESIVO'] }] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            ocupacional: {
              $sum: {
                $cond: {
                  if: { $eq: ['$tipoLente.nombre', 'OCUPACIONAL'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            fotosensibles: {
              $sum: {
                $cond: {
                  if: {
                    $or: [{ $eq: ['$tipoColor.nombre', 'SOLAR ACTIVE'] }],
                  },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },

            ventasSet: { $addToSet: '$_id' },
          },
        },
        {
          $project: {
            lentes: 1,
            antireflejo: 1,
            tickets: {
              $size: '$ventasSet',
            },
            monturas: 1,
            porcentajeAntireflejo: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$antireflejo', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            progresivos: 1,
            ocupacional: 1,
            progresivosOcupacionales: {
              $add: ['$progresivos', '$ocupacional'],
            },
            progresivosOcupacionalesPorcentaje: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $add: ['$progresivos', '$ocupacional'] },
                            '$lentes',
                          ],
                        },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeProgresivos: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$progresivos', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeOcupacionales: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$ocupacional', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            fotosensibles: 1,
            procentajeFotosensibles: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$fotosensibles', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ];

      const dataKpi = await this.venta.aggregate(pipeline);

      // CORREGIDO: Acceder correctamente a las propiedades del objeto sucursal
      const resultado = {
        sucursal: sucursal.nombre || sucursal, // Manejar caso donde sucursal sea solo el ID
        id: sucursal._id || sucursal,
        dataKpi: dataKpi[0] || {
          // Asegurar que siempre haya un objeto resultado
          lentes: 0,
          antireflejo: 0,
          tickets: 0,
          monturas: 0,
          porcentajeAntireflejo: 0,
          progresivos: 0,
          ocupacional: 0,
          progresivosOcupacionales: 0,
          progresivosOcupacionalesPorcentaje: 0,
          porcentajeProgresivos: 0,
          porcentajeOcupacionales: 0,
          fotosensibles: 0,
          procentajeFotosensibles: 0,
        },
      };

      data.push(resultado);
    }

    return data;
  }

  private async kpiTuOpticaEmpresa(
    kpiEmpresaDto: BuscadorVentaLenteDto,
    sucursales: any[],
  ) {
    const filtrador = filtradorVenta(kpiEmpresaDto);
    const sucursalesIds = sucursales.map((sucursal) => sucursal);
    console.log('filtrador', { ...filtrador, sucursal: sucursalesIds });
    const data: any[] = [];

    for (let sucursal of sucursales) {
      const pipeline = [
        {
          $match: {
            ...filtrador,
            sucursal: sucursal._id,
          },
        },
        {
          $lookup: {
            from: 'DetalleVenta',
            localField: '_id',
            foreignField: 'venta',
            as: 'detalleVenta',
          },
        },
        {
          $unwind: { path: '$detalleVenta', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Producto',
            localField: 'detalleVenta.producto',
            foreignField: '_id',
            as: 'producto',
          },
        },
        {
          $unwind: { path: '$producto', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Receta',
            localField: 'detalleVenta.receta',
            foreignField: '_id',
            as: 'receta',
          },
        },
        {
          $unwind: { path: '$receta', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Tratamiento',
            localField: 'receta.tratamiento',
            foreignField: '_id',
            as: 'tratamiento',
          },
        },
        {
          $unwind: { path: '$tratamiento', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'TipoLente',
            localField: 'receta.tipoLente',
            foreignField: '_id',
            as: 'tipoLente',
          },
        },
        {
          $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: true },
        },

        {
          $lookup: {
            from: 'TipoColor',
            localField: 'receta.tipoColor',
            foreignField: '_id',
            as: 'tipoColor',
          },
        },
        {
          $unwind: { path: '$tipoColor', preserveNullAndEmptyArrays: true },
        },
        // Agrupar y Calcular KPIs

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

              $sum: {
                $cond: {
                  if: { $eq: ['$detalleVenta.rubro', 'LENTE'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            monturas: {
              $sum: {
                $cond: {
                  if: { $eq: ['$detalleVenta.rubro', 'MONTURA'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            antireflejo: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$tratamiento.nombre', 'BLUE SHIELD'] },
                      { $eq: ['$tratamiento.nombre', 'GREEN SHIELD'] },
                      { $eq: ['$tratamiento.nombre', 'ANTIREFLEJO'] },
                    ],
                  },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },

            progresivos: {
              $sum: {
                $cond: {
                  if: { $or: [{ $eq: ['$tipoLente.nombre', 'PROGRESIVO'] }] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            ocupacional: {
              $sum: {
                $cond: {
                  if: { $eq: ['$tipoLente.nombre', 'OCUPACIONAL'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            fotosensibles: {
              $sum: {
                $cond: {
                  if: {
                    $or: [{ $eq: ['$tipoColor.nombre', 'SOLAR ACTIVE'] }],
                  },
                  then: '$cantidad',
                  else: 0,
                },
              },
            },

            ventasSet: { $addToSet: '$_id' },

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

            lentes: 1,
            antireflejo: 1,
            tickets: {
              $size: '$ventasSet',
            },
            monturas: 1,
            porcentajeAntireflejo: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$antireflejo', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            progresivos: 1,
            ocupacional: 1,
            progresivosOcupacionales: {
              $add: ['$progresivos', '$ocupacional'],
            },
            progresivosOcupacionalesPorcentaje: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $add: ['$progresivos', '$ocupacional'] },
                            '$lentes',
                          ],
                        },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeProgresivos: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$progresivos', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            porcentajeOcupacionales: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$ocupacional', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
            fotosensibles: 1,
            procentajeFotosensibles: {
              $cond: {
                if: { $gt: ['$lentes', 0] },
                then: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$fotosensibles', '$lentes'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
                else: 0,
              },
            },
          },
        },
      ];

      const dataKpi = await this.venta.aggregate(pipeline);

      // CORREGIDO: Acceder correctamente a las propiedades del objeto sucursal
      const resultado = {
        sucursal: sucursal.nombre || sucursal, // Manejar caso donde sucursal sea solo el ID
        id: sucursal._id || sucursal,
        dataKpi: dataKpi[0] || {
          // Asegurar que siempre haya un objeto resultado
          lentes: 0,
          antireflejo: 0,
          tickets: 0,
          monturas: 0,
          porcentajeAntireflejo: 0,
          progresivos: 0,
          ocupacional: 0,
          progresivosOcupacionales: 0,
          progresivosOcupacionalesPorcentaje: 0,
          porcentajeProgresivos: 0,
          porcentajeOcupacionales: 0,
          fotosensibles: 0,
          procentajeFotosensibles: 0,
        },
      };

      data.push(resultado);
    }

    return data;
  }

  private async kpiOptiserviceEmpresa(
    kpiEmpresaDto: BuscadorVentaLenteDto,
    sucursales: any[],
  ) {
    const filtrador = filtradorVenta(kpiEmpresaDto);
    const sucursalesIds = sucursales.map((sucursal) => sucursal);
    console.log('filtrador', { ...filtrador, sucursal: sucursalesIds });
    const data: any[] = [];

    for (let sucursal of sucursales) {
      const pipeline = [
        {
          $match: {
            ...filtrador,
            sucursal: sucursal._id,
          },
        },
        {
          $lookup: {
            from: 'DetalleVenta',
            localField: '_id',
            foreignField: 'venta',
            as: 'detalleVenta',
          },
        },
        {
          $unwind: { path: '$detalleVenta', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Producto',
            localField: 'detalleVenta.producto',
            foreignField: '_id',
            as: 'producto',
          },
        },
        {
          $unwind: { path: '$producto', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Receta',
            localField: 'detalleVenta.receta',
            foreignField: '_id',
            as: 'receta',
          },
        },
        {
          $unwind: { path: '$receta', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'Tratamiento',
            localField: 'receta.tratamiento',
            foreignField: '_id',
            as: 'tratamiento',
          },
        },
        {
          $unwind: { path: '$tratamiento', preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: 'TipoLente',
            localField: 'receta.tipoLente',
            foreignField: '_id',
            as: 'tipoLente',
          },
        },
        {
          $unwind: { path: '$tipoLente', preserveNullAndEmptyArrays: true },
        },

        {
          $lookup: {
            from: 'TipoColor',
            localField: 'receta.tipoColor',
            foreignField: '_id',
            as: 'tipoColor',
          },
        },
        {
          $unwind: { path: '$tipoColor', preserveNullAndEmptyArrays: true },
        },
        // Agrupar y Calcular KPIs
        {
          $group: {
            _id: null,
            lentes: {
              $sum: {
                $cond: {
                  if: { $eq: ['$detalleVenta.rubro', 'LENTE'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            monturas: {
              $sum: {
                $cond: {
                  if: { $eq: ['$detalleVenta.rubro', 'MONTURA'] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },
            antireflejo: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$tratamiento.nombre', 'BLUE SHIELD'] },
                      { $eq: ['$tratamiento.nombre', 'GREEN SHIELD'] },
                      { $eq: ['$tratamiento.nombre', 'ANTIREFLEJO'] },
                    ],
                  },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },

            progresivos: {
              $sum: {
                $cond: {
                  if: { $or: [{ $eq: ['$tipoLente.nombre', 'PROGRESIVO'] }] },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },

            fotoCromatico: {
              $sum: {
                $cond: {
                  if: {
                    $or: [
                      { $eq: ['$tipoColor.nombre', 'FOTOCROMATICO GRIS'] },
                      { $eq: ['$tipoColor.nombre', 'FOTOCROMATICO CAFE'] },
                      { $eq: ['$tipoColor.nombre', 'FOTOCROMATICO'] },
                      { $eq: ['$tipoColor.nombre', 'SOLAR ACTIVE'] },
                    ],
                  },
                  then: '$detalleVenta.cantidad',
                  else: 0,
                },
              },
            },

            ventasSet: { $addToSet: '$_id' },
          },
        },
        {
          $project: {
            monturas: 1,
            lentes: 1,
            antireflejo: 1,
            progresivos: 1,
            fotoCromatico: 1,
            tickets: {
              $size: '$ventasSet',
            },
            //ventas:1,
            porcentajeProgresivos: {
              $round: [
                {
                  $multiply: [{ $divide: ['$progresivos', '$lentes'] }, 100],
                },
                0,
              ],
            },
            porcentajeAntireflejo: {
              $round: [
                {
                  $multiply: [{ $divide: ['$antireflejo', '$lentes'] }, 100],
                },
                0,
              ],
            },

            procentajeFotoCromatico: {
              $round: [
                {
                  $multiply: [{ $divide: ['$fotoCromatico', '$lentes'] }, 100],
                },
                0,
              ],
            },
          },
        },
      ];

      const dataKpi = await this.venta.aggregate(pipeline);

      // CORREGIDO: Acceder correctamente a las propiedades del objeto sucursal
      const resultado = {
        sucursal: sucursal.nombre || sucursal, // Manejar caso donde sucursal sea solo el ID
        id: sucursal._id || sucursal,
        dataKpi: dataKpi[0] || {
          // Asegurar que siempre haya un objeto resultado
          monturas: 0,
          lentes: 0,
          antireflejo: 0,
          progresivos: 0,
          fotoCromatico: 0,
          tickets: 0,
          porcentajeProgresivos: 0,
          porcentajeAntireflejo: 0,
          procentajeFotoCromatico: 0,
        },
      };

      data.push(resultado);
    }


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

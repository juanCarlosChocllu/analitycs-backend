import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DetalleVenta } from '../schema/detalleVenta';
import { Venta } from '../schema/venta.schema';
import { Model, Types } from 'mongoose';
import { resultadoRecetaI, VentaMedicoI } from '../interface/ventaMedicos';
import { BuscadorVentaDto } from '../dto/BuscadorVenta.dto';
import { VentaMedicosDto } from '../dto/venta.medicos.dto';
import { filtradorMedicos } from '../utils/filtro.medicos.util';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { SucursalI } from 'src/sucursal/interfaces/sucursal.interface';
import { tasaConversion } from 'src/core-app/utils/coreAppUtils';
import { BuscadorRecetaDto } from '../dto/BuscadorReceta.dto';
import { RecetaService } from 'src/receta/receta.service';

@Injectable()
export class VentaMedicosService {
  constructor(
    @InjectModel(Venta.name)
    private readonly venta: Model<Venta>,

    private readonly recetaService: RecetaService,
    private readonly sucursalService: SucursalService,
  ) {}

  public async kpiMedicos(ventaMedicosDto: VentaMedicosDto) {
    const { especialidad, ...nuevoFiltro } = filtradorMedicos(ventaMedicosDto);
    const data: VentaMedicoI[] = [];
    console.log(nuevoFiltro);
    
    try {
      for (const empresa of ventaMedicosDto.empresa) {
        let sucursalesEmpresa = await this.filtroSucursal(
          ventaMedicosDto,
          new Types.ObjectId(empresa),
        );

        for (let sucursal of sucursalesEmpresa) {
          const dataMedicos = await this.venta.aggregate([
            {
              $match: {
                sucursal: new Types.ObjectId(sucursal._id),
                ...nuevoFiltro,

                ...(ventaMedicosDto.medico
                  ? { oftalmologo: new Types.ObjectId(ventaMedicosDto.medico) }
                  : {}),
              },
            },

            {
              $lookup: {
                from: 'DetalleMedico',
                foreignField: '_id',
                localField: 'detalleMedico',
                as: 'detalleMedico',
              },
            },

            {
              $lookup: {
                from: 'Medico',
                foreignField: '_id',
                localField: 'detalleMedico.0.medico',
                as: 'medico',
              },
            },
            {
              $unwind: { path: '$medico', preserveNullAndEmptyArrays: false },
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

            ...(especialidad
              ? [
                  {
                    $match: {
                      'detalleMedico.especialidad': especialidad,
                    },
                  },
                ]
              : []),

            {
              $group: {
                _id: '$medico.nombre',
                cantidad: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$detalleVenta.rubro', 'LENTE'] },
                      then: '$detalleVenta.cantidad',
                      else: 0,
                    },
                  },
                },

                lenteDeContacto: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$detalleVenta.rubro', 'LENTE DE CONTACTO'] },
                      then: '$detalleVenta.cantidad',
                      else: 0,
                    },
                  },
                },

                medico: { $first: '$medico._id' },
                e: {
                  $first: { $arrayElemAt: ['$detalleMedico.especialidad', 0] },
                },

                importe: {
                  $sum: {
                    $cond: {
                      if: { $eq: ['$detalleVenta.rubro', 'LENTE'] },
                      then: '$detalleVenta.importe',
                      else: 0,
                    },
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                nombre: '$_id',
                cantidad: 1, //cantidad de ventas realizadas
                medico: 1,
                ventasLenteLc: { $add: ['$cantidad', '$lenteDeContacto'] }, //cantidad de ventas realizadas  + lente de contacto
                importe: 1,
                e: 1, //especialidad
              },
            },
          ]);
          const resultado: VentaMedicoI = {
            ventaLenteLc: dataMedicos.reduce(
              (acc, item) => acc + item.ventasLenteLc,
              0,
            ),
            sucursal: sucursal.nombre,
            totalRecetas: dataMedicos.reduce(
              (acc, item) => acc + item.cantidad,
              0,
            ),

            importe: dataMedicos.reduce((acc, item) => acc + item.importe, 0),

            idScursal: sucursal._id,
            data: dataMedicos,
          };
          data.push(resultado);
        }
      }

      return data;
    } catch (error) {
      return new BadRequestException();
    }
  }
  async filtroSucursal(
    ventaMedicosDto: VentaMedicosDto,
    empresa: Types.ObjectId,
  ) {
    const sucursal: SucursalI[] = [];
    if (ventaMedicosDto.empresa && ventaMedicosDto.sucursal.length <= 0) {
      const sucursales = await this.sucursalService.sucursalListaEmpresas(
        new Types.ObjectId(empresa),
      );
      sucursal.push(...this.clasificacionSucursal(sucursales));
    } else {
      const sucursalesEmpresa = await this.sucrsalFiltrado(
        ventaMedicosDto.sucursal,
      );
      sucursal.push(...this.clasificacionSucursal(sucursalesEmpresa));
    }
    return sucursal;
  }
  private clasificacionSucursal(sucursalesEmpresa: SucursalI[]) {
    const sucursales: SucursalI[] = [];
    if (sucursalesEmpresa.length > 1) {
      for (const su of sucursalesEmpresa) {
        if (su.nombre !== 'OPTICENTRO PARAGUAY') {
          sucursales.push(su);
        }
      }
    } else if (sucursalesEmpresa.length == 1) {
      for (const su of sucursalesEmpresa) {
        if (su.nombre == 'OPTICENTRO PARAGUAY') {
          sucursales.push(su);
        } else {
          sucursales.push(su);
        }
      }
    }
    return sucursales;
  }

  async sucrsalFiltrado(sucursal: Types.ObjectId[]) {
    const sucursales: SucursalI[] = [];
    if (sucursal.length > 1) {
      for (const s of sucursal) {
        const su: SucursalI = await this.sucursalService.listarSucursalId(s);

        if (su.nombre !== 'OPTICENTRO PARAGUAY') {
          sucursales.push(su);
        }
      }
    } else if (sucursal.length == 1) {
      for (const s of sucursal) {
        const su: SucursalI = await this.sucursalService.listarSucursalId(s);
        if (su.nombre == 'OPTICENTRO PARAGUAY') {
          sucursales.push(su);
        } else {
          sucursales.push(su);
        }
      }
    }
    return sucursales;
  }

  async listarRecetasMedico(buscadorRecetaDto: BuscadorRecetaDto) {
    const recetasMedico =
      await this.recetaService.listarRecetaMedicos(buscadorRecetaDto);

    const data = await Promise.all(
      recetasMedico.map(async (item) => {
        const recetasMedico: resultadoRecetaI[] = [];
        for (const data of item.data) {
          const ventas = await this.venta.find(
            {
              codigoConversion: data.codigo,
              cotizacion: false,
              estadoTracking: { $ne: 'ANULADO' },
            },
            { codigoConversion: 1, id_venta: 1, flagVenta: 1, fechaVenta: 1 },
          );
          if (ventas.length > 0) {
            for (const venta of ventas) {
              const receta: resultadoRecetaI = {
                idVenta: venta ? venta.id_venta : '',
                codigoReceta: data.codigo,
                flagVenta: venta ? venta.flagVenta : '',
                cantidad: venta ? 1 : 0,
                fechaVenta: venta.fechaVenta,
                fechaReceta: data.fecha,
              };
              recetasMedico.push(receta);
            }
          } else {
            const receta: resultadoRecetaI = {
              idVenta: '',
              codigoReceta: data.codigo,
              flagVenta: '',
              cantidad: 0,
              fechaVenta: '',
              fechaReceta: data.fecha,
            };
            recetasMedico.push(receta);
          }
        }
        const ventasRealizadas: number = recetasMedico.reduce(
          (acc, item) => item.cantidad + acc,
          0,
        );

        return {
          recetasMedico: recetasMedico,
          id: item.idMedico,
          medico: item.nombre,
          especialidad: item.especialidad,
          recetasRegistradas: item.recetas,
          ventasFinalizadas: recetasMedico.filter(
            (item) => item.flagVenta === 'FINALIZADO',
          ).length,
          ventasRealizadas: ventasRealizadas,
          tasaConversion: tasaConversion(ventasRealizadas, item.recetas),
        };
      }),
    );
    return data;
  }
}

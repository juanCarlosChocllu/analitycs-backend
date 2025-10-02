import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRendimientoDiarioDto } from './dto/create-rendimiento-diario.dto';
import { UpdateRendimientoDiarioDto } from './dto/update-rendimiento-diario.dto';
import { Request } from 'express';
import { RendimientoDiario } from './schema/rendimientoDiarioSchema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';

import { rendimientoI } from './interface/rendimiento';

import { BuscadorRendimientoDiarioDto } from './dto/BuscardorRendimientoDiario';
import { Flag } from 'src/sucursal/enums/flag.enum';
import { PaginadorCoreDto } from 'src/core-app/dto/PaginadorCoreDto';
import { calcularPaginas, skip } from 'src/core-app/utils/coreAppUtils';
import { VentaService } from 'src/venta/service/venta.service';
import { VentaRendimientoDiarioService } from 'src/venta/service/ventaRendimientoDiario.service';

@Injectable()
export class RendimientoDiarioService {
  constructor(
    @InjectModel(RendimientoDiario.name)
    private readonly rendimientoDiario: Model<RendimientoDiario>,
    @Inject(forwardRef(() => VentaRendimientoDiarioService))
    private readonly ventaRendimientoDiarioService: VentaRendimientoDiarioService,
  ) {}
  async create(
    createRendimientoDiarioDto: CreateRendimientoDiarioDto,
    request: Request,
  ) {
    if (!request.usuario.idUsuario || !request.usuario.detalleAsesor) {
      throw new BadRequestException(
        'Deve tener una sucursal asignada para este registro',
      );
    }

    const asesor: Types.ObjectId = new Types.ObjectId(
      request.usuario.detalleAsesor,
    );
    const date = new Date();
    const diaRegistro: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const verificar = await this.rendimientoDiario.countDocuments({
      detalleAsesor: new Types.ObjectId(asesor),
      fechaDia: diaRegistro,
      flag: Flag.nuevo,
    });
    if (verificar > 0) {
      throw new ConflictException(
        `Rendiemiento de la fecha ${diaRegistro} ya fue registrado`,
      );
    }

    await this.rendimientoDiario.create({
      ...createRendimientoDiarioDto,
      detalleAsesor: asesor,
      fechaDia: diaRegistro,
    });
    return { status: HttpStatus.CREATED };
  }
  async findAll(buscadorRendimientoDiarioDto: BuscadorRendimientoDiarioDto) {
 
    
    const ventas =
      await this.ventaRendimientoDiarioService.ventasParaRendimientoDiario(
        buscadorRendimientoDiarioDto,
      );
    const rendimiento = await Promise.all(
      ventas.map(async (item) => {
        const resultado = await Promise.all(
          item.ventaAsesor.map(async (data) => {
            const ventas = await Promise.all(
              data.ventas.map(async (item) => {
                let antireflejos: number = 0;
                let progresivos: number = 0;
                for (const receta of item.receta) {
                  const data = receta.descripcion.split('/');

                  const tipoLente = data[1];
                  const tratamiento = data[3];
                  if (tipoLente === 'PROGRESIVO') {
                    progresivos += 1;
                  }
                  if (
                    tratamiento === 'ANTIREFLEJO' ||
                    tratamiento === 'BLUE SHIELD' ||
                    tratamiento === 'GREEN SHIELD' ||
                    tratamiento === 'CLARITY' ||
                    tratamiento === 'CLARITY PLUS' ||
                    tratamiento === 'STOP AGE'
                  ) {
                    antireflejos += 1;
                  }
                }

                const rendimientoDia = await this.rendimientoDiario.findOne({
                  fechaDia: item.fecha,
                  detalleAsesor: item.asesorId,
                  flag: Flag.nuevo,
                });

                const resultado: rendimientoI = {
                  asesor: data.asesor,
                  antireflejos: antireflejos,
                  atenciones: rendimientoDia ? rendimientoDia.atenciones : 0,
                  cantidadLente: item.lente,
                  entregas: item.entregadas,
                  lc: item.lc,
                  montoTotalVentas: item.montoTotal,
                  progresivos: progresivos,
                  fecha: item.fecha,
                  idAsesor: item.asesorId,
                  segundoPar: rendimientoDia ? rendimientoDia.segundoPar : 0,
                  ticket: item.ticket,
                };

                return resultado;
              }),
            );
            return {
              asesor: data.asesor,
              ventaAsesor: ventas,
            };
          }),
        );

        return {
          sucursal: item.sucursal,
          metaTicket: item.metaTicket,
          diasComerciales: item.diasComerciales,
          metaMonto: item.metaMonto,
          ventas: resultado,
        };
      }),
    );

  

    return rendimiento;
  }

  async listarRendimientoDiarioAsesor(
    request: Request,
    paginadorDto: PaginadorCoreDto,
  ) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          flag: 'nuevo',
          ...(request.usuario.detalleAsesor && {
            detalleAsesor: new Types.ObjectId(request.usuario.detalleAsesor),
          }),
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
          localField: 'detalleAsesor.asesor',
          as: 'asesor',
        },
      },
      {
        $lookup: {
          from: 'Sucursal',
          foreignField: '_id',
          localField: 'detalleAsesor.sucursal',
          as: 'sucursal',
        },
      },
      {
        $project: {
          asesor: { $arrayElemAt: ['$asesor.nombre', 0] },
          sucursal: { $arrayElemAt: ['$sucursal.nombre', 0] },
          atenciones: 1,
          segundoPar: 1,
          presupuesto: 1,
          fecha: 1,
          fechaDia: 1,
        },
      },
      {
        $sort: { fecha: -1 },
      },
      {
        $skip: skip(paginadorDto.pagina, paginadorDto.limite),
      },
      {
        $limit: paginadorDto.limite,
      },
    ];

    const [countDocuments, rendimiento] = await Promise.all([
      this.rendimientoDiario.countDocuments({
        ...(request.usuario.detalleAsesor && {
          asesor: new Types.ObjectId(request.usuario.detalleAsesor),
        }),
      }),
      this.rendimientoDiario.aggregate(pipeline),
    ]);

    const paginas = calcularPaginas(countDocuments, paginadorDto.limite);
   
    
    return {
      paginas: paginas,
      paginaActual: paginadorDto.pagina,
      data: rendimiento,
    };
  }

  /* async rendimientoDiarioAsesor(request: Request) {
    if (!request.usuario.detalleAsesor) {
      throw new NotFoundException(
        'Su usuario deve estar vinculado a un asesor',
      );
    }

    const ventas =
      await this.ventaRendimientoDiarioService.ventasParaRendimientoDiarioAsesor(request);
    const data = await Promise.all(
      ventas.map(async (item) => {
        let antireflejos: number = 0;
        let progresivos: number = 0;
        for (const receta of item.receta) {
          const data = receta.descripcion.split('/');

          const tipoLente = data[1];
          const tratamiento = data[3];
          if (tipoLente === 'PROGRESIVO') {
            progresivos += 1;
          }
          if (
            tratamiento === 'ANTIREFLEJO' ||
            tratamiento === 'BLUE SHIELD' ||
            tratamiento === 'GREEN SHIELD' ||
            tratamiento === 'CLARITY' ||
            tratamiento === 'CLARITY PLUS' ||
            tratamiento === 'STOP AGE'
          ) {
            antireflejos += 1;
          }
        }

        const rendimientoDia = await this.rendimientoDiario.findOne({
          fechaDia: item.fecha,
          asesor: item.asesorId,
          flag: Flag.nuevo,
        });

        const resultado: rendimientoI = {
          asesor: item.asesor,
          antireflejos: antireflejos,
          atenciones: rendimientoDia ? rendimientoDia.atenciones : 0,
          cantidadLente: item.lente,
          entregas: item.entregadas,
          lc: item.lc,
          montoTotalVentas: item.montoTotal,
          progresivos: progresivos,
          fecha: item.fecha,
          idAsesor: item.asesorId,
          segundoPar: rendimientoDia ? rendimientoDia.segundoPar : 0,
          ticket: item.ticket,
        };
        return resultado;
      }),
    );

    return data;
  }*/
  async update(
    updateRendimientoDiarioDto: UpdateRendimientoDiarioDto,
    id: Types.ObjectId,
  ) {
    const date = new Date();
    const rendimiento = await this.rendimientoDiario.findOne({
      _id: new Types.ObjectId(id),
    });
    const diaRegistro: string = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    if (rendimiento) {
      if (rendimiento.fechaDia == diaRegistro) {
        return await this.rendimientoDiario.updateOne(
          { _id: new Types.ObjectId(id) },
          updateRendimientoDiarioDto,
        );
      }
      throw new BadRequestException('Tua tiempo de edicion expiro');
    }
    throw new NotFoundException();
  }

  public async listarRedimientoDiarioDia(
    asesor: Types.ObjectId[],
    dia: string,
  ) {
    const rendimiento = await this.rendimientoDiario.find({
      flag: Flag.nuevo,
      fechaDia: dia,
      detalleAsesor: { $in: asesor.map((item) => new Types.ObjectId(item)) },
    });
    return rendimiento;
  }
}

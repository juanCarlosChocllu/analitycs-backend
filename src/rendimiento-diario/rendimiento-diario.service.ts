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


import { BuscadorRendimientoDiarioDto } from './dto/BuscardorRendimientoDiario';
import { Flag } from 'src/sucursal/enums/flag.enum';
import { PaginadorCoreDto } from 'src/core-app/dto/PaginadorCoreDto';
import {
  calcularPaginas,
  skip,
} from 'src/core-app/utils/coreAppUtils';
import { VentaRendimientoDiarioService } from 'src/venta/service/ventaRendimientoDiario.service';
import { JornadaService } from 'src/jornada/jornada.service';
import { formatearFechaVentaStr } from './utils/rendimientoDiario';

@Injectable()
export class RendimientoDiarioService {
  constructor(
    @InjectModel(RendimientoDiario.name)
    private readonly rendimientoDiario: Model<RendimientoDiario>,
    @Inject(forwardRef(() => VentaRendimientoDiarioService))
    private readonly ventaRendimientoDiarioService: VentaRendimientoDiarioService,
    private readonly jornadaService: JornadaService,
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
    const anio = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    const diaRegistro = `${anio}-${mes}-${dia}`;

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
            const [ventas, dias] = await Promise.all([
              Promise.all(
                data.ventas.map(async (item) => {
                  const { antireflejos, progresivos } =
                    await this.calcularProgresivoAntireflejo(item.receta);
                  const dia = formatearFechaVentaStr(item.fecha);
                  const rendimientoDia = await this.rendimientoDiario.findOne({
                    fechaDia: dia,
                    detalleAsesor: data.detalleAsesor,
                    flag: Flag.nuevo,
                  });

                  return {
                    asesor: data.asesor,
                    antireflejos,
                    atenciones: rendimientoDia ? rendimientoDia.atenciones : 0,
                    cantidadLente: item.lente,
                    entregas: item.entregadas,
                    lc: item.lc,
                    montoTotalVentas: item.montoTotal,
                    progresivos,
                    fecha: item.fecha,
                    idAsesor: item.asesorId,
                    segundoPar: rendimientoDia ? rendimientoDia.segundoPar : 0,
                    ticket: item.ticket,
                  };
                }),
              ),
              this.jornadaService.buscarDiasTrabajados(
                buscadorRendimientoDiarioDto.fechaInicio,
                buscadorRendimientoDiarioDto.fechaFin,
                data.detalleAsesor,
              ),
            ]);

            return {
              asesor: data.asesor,
              dias: dias,
              ventaAsesor: ventas,
            };
          }),
        );
        return {
          empresa: item.empresa,
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

  async calcularProgresivoAntireflejo(receta: any[]) {
    let antireflejos = 0;
    let progresivos = 0;
    for (const re of receta) {
      const data = re.descripcion.split('/');
      const tipoLente = data[1];
      const tratamiento = data[3];

      if (tipoLente === 'PROGRESIVO' || tipoLente === 'OCUPACIONAL')
        progresivos++;
      if (tratamiento !== 'SIN TRATAMIENTO') {
        antireflejos++;
      }
    }
    return { antireflejos, progresivos };
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

  async update(
    updateRendimientoDiarioDto: UpdateRendimientoDiarioDto,
    id: Types.ObjectId,
  ) {
    const date = new Date();
    const rendimiento = await this.rendimientoDiario.findOne({
      _id: new Types.ObjectId(id),
    });
    const anio = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    const diaRegistro = `${anio}-${mes}-${dia}`;
    if (rendimiento) {
      if (rendimiento.fechaDia == diaRegistro) {
        return await this.rendimientoDiario.updateOne(
          { _id: new Types.ObjectId(id) },
          updateRendimientoDiarioDto,
        );
      }
      throw new BadRequestException('Tu tiempo de edicion expiro');
    }
    throw new NotFoundException();
  }

  public async listarRedimientoDiarioDia(
    asesor: Types.ObjectId[],
    dia: string,
  ) {
    const diaFormateada = formatearFechaVentaStr(dia);
    const rendimiento = await this.rendimientoDiario.find({
      flag: Flag.nuevo,
      fechaDia: diaFormateada,
      detalleAsesor: { $in: asesor },
    });
    return rendimiento;
  }
}

import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMetasSucursalDto } from '../dto/create-metas-sucursal.dto';
import { UpdateMetasSucursalDto } from '../dto/update-metas-sucursal.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BuscadorMetasDto } from '../dto/BuscadorMetasDto';
import { MetasSucursal } from '../schema/metas-sucursal.schema';
import { DiasMetaService } from './diaMeta.service';

import { SucursalService } from 'src/sucursal/sucursal.service';
import { webhookMentasI } from '../interface/metasInterface';
import { formaterFechaHora, skip } from 'src/core-app/utils/coreAppUtils';
import { Flag } from 'src/sucursal/enums/flag.enum';
import { FlagVentaE } from 'src/venta/enum/ventaEnum';

@Injectable()
export class MetasSucursalService {
  constructor(
    @InjectModel(MetasSucursal.name)
    private readonly metasSucursal: Model<MetasSucursal>,
  ) {}

  async create(createMetasSucursalDto: CreateMetasSucursalDto) {
    for (const sucursal of createMetasSucursalDto.sucursal) {
      const meta = await this.metasSucursal.create({
        ticket: createMetasSucursalDto.ticket,
        fechaFin: createMetasSucursalDto.fechaFin,
        fechaInicio: createMetasSucursalDto.fechaInicio,
        monto: createMetasSucursalDto.monto,
        dias: createMetasSucursalDto.dias,
        sucursal: new Types.ObjectId(sucursal),
      });
    }

    return { status: HttpStatus.CREATED };
  }

  async findAll(buscadorMetasDto: BuscadorMetasDto) {
    console.log(buscadorMetasDto);

    const { f1, f2 } = formaterFechaHora(
      buscadorMetasDto.fechaInicio,
      buscadorMetasDto.fechaFin,
    );

    const { f1: fechaMetaInicio, f2: fechaMetaFin } = formaterFechaHora(
      buscadorMetasDto.fechaMetaInicio,
      buscadorMetasDto.fechaMetaFin,
    );

    const countDocuments = await this.metasSucursal.countDocuments({
      flag: Flag.nuevo,
      ...(buscadorMetasDto.sucursal
        ? { sucursal: new Types.ObjectId(buscadorMetasDto.sucursal) }
        : {}),

      ...(buscadorMetasDto.fechaInicio && buscadorMetasDto.fechaFin
        ? {
            fecha: {
              $gte: f1,
              $lte: f2,
            },
          }
        : {}),

      ...(buscadorMetasDto.fechaMetaInicio && buscadorMetasDto.fechaMetaFin
        ? { fechaInicio: fechaMetaInicio, fechaFin: fechaMetaFin }
        : {}),
    });

    const paginas = Math.ceil(countDocuments / buscadorMetasDto.limite);

    const metas = await this.metasSucursal
      .aggregate([
        {
          $match: {
            flag: Flag.nuevo,
            ...(buscadorMetasDto.sucursal
              ? { sucursal: new Types.ObjectId(buscadorMetasDto.sucursal) }
              : {}),

            ...(buscadorMetasDto.fechaInicio && buscadorMetasDto.fechaFin
              ? {
                  fechaCreacion: {
                    $gte: f1,
                    $lte: f2,
                  },
                }
              : {}),

            ...(buscadorMetasDto.fechaMetaInicio &&
            buscadorMetasDto.fechaMetaFin
              ? {
                  fechaInicio: { $gte: fechaMetaInicio },
                  fechaFin: { $lte: fechaMetaFin },
                }
              : {}),
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
          $sort: { fechaCreacion: -1 },
        },
        {
          $project: {
            _id: 1,
            monto: 1,
            ticket: 1,
            dias: 1,
            sucursal: '$sucursal.nombre',
            fechaInicio: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$fechaInicio',
              },
            },
            fechaFin: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$fechaFin',
              },
            },
            fecha: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$fechaCreacion',
              },
            },
          },
        },
      ])
      .skip(skip(buscadorMetasDto.pagina, buscadorMetasDto.limite))
      .limit(buscadorMetasDto.limite);

    return { paginas: paginas == 0 ? 1 : paginas, data: metas };
  }

  async softDelete(id: Types.ObjectId) {
    const meta = await this.metasSucursal.findOne({
      _id: new Types.ObjectId(id),
      flag: Flag.nuevo,
    });
    if (!meta) {
      throw new NotFoundException();
    }
    await this.metasSucursal.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { flag: Flag.eliminado },
    );

    return { status: HttpStatus.OK };
  }

  async listarMetasSucursal(sucursal: Types.ObjectId, fechaInicio: Date) {
    const meta = await this.metasSucursal.findOne({
      sucursal: new Types.ObjectId(sucursal),
      flag: Flag.nuevo,
      fechaInicio: fechaInicio,
    });

    return meta;
  }

  async listarMetasPorSucursal(sucursal: Types.ObjectId, fechaInicio: Date) {
    const metas = await this.metasSucursal.findOne(
      {
        sucursal: new Types.ObjectId(sucursal),
        fechaInicio: fechaInicio,
        flag: Flag.nuevo,
      },
      { monto: 1, dias: 1, ticket: 1 },
    );
    return metas;
  }
}

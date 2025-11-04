import { Injectable } from '@nestjs/common';
import { CreateFacingDto } from './dto/create-facing.dto';
import { UpdateFacingDto } from './dto/update-facing.dto';
import { Facing } from './schema/facing.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Flag } from 'src/sucursal/enums/flag.enum';
import { BuscadorFacingDto } from './dto/BuscadorFacingDto';

@Injectable()
export class FacingService {
  @InjectModel(Facing.name)
  private readonly facing: Model<Facing>;
  async create(createFacingDto: CreateFacingDto) {
    for (const sucursal of createFacingDto.sucursal) {
      for (const item of createFacingDto.marca) {
        await this.facing.create({
          cantidad: createFacingDto.cantidad,
          exhibicion: new Types.ObjectId(createFacingDto.exhibicion),
          marca: new Types.ObjectId(item),
          sucursal: new Types.ObjectId(sucursal),
        });
      }
    }
  }
  async listarFacing(buscadorFacingDto: BuscadorFacingDto) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          flag: Flag.nuevo,
          sucursal: {
            $in: buscadorFacingDto.sucursal.map(
              (item) => new Types.ObjectId(item),
            ),
          },
          fechaCreacion: {
            $gte: buscadorFacingDto.fechaInicio,
            $lte: buscadorFacingDto.fechaFin,
          },
        },
      },
      {
        $lookup: {
          from: 'Exhibicion',
          foreignField: '_id',
          localField: 'exhibicion',
          as: 'exhibicion',
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
        $lookup: {
          from: 'Marca',
          foreignField: '_id',
          localField: 'marca',
          as: 'marca',
        },
      },
      {
        $project: {
          _id: 1,
          cantidad: 1,
          sucursal: { $arrayElemAt: ['$sucursal.nombre', 0] },
          exhibicion: { $arrayElemAt: ['$exhibicion.nombre', 0] },
          marca: { $arrayElemAt: ['$marca.nombre', 0] },
          fechaCreacion: 1,
        },
      },
    ];
    const facing = await this.facing.aggregate(pipeline);

    return facing;
  }

  async cantidadDeFacing(
    marca: Types.ObjectId,
    sucursal: Types.ObjectId,
    fechaInicio: Date,
    fechaFin: Date,
  ) {
    const data = await this.facing.aggregate([
      {
        $match: {
          marca: new Types.ObjectId(marca),
          sucursal: new Types.ObjectId(sucursal),
          fechaCreacion: { $gte: fechaInicio, $lte: fechaFin },
        },
      },
      {
        $group: {
          _id: null,
          cantidad: { $sum: '$cantidad' },
        },
      },
    ]);

    return data[0]?.cantidad || 0;
  }
}

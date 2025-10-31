import { Injectable } from '@nestjs/common';
import { CreateFacingDto } from './dto/create-facing.dto';
import { UpdateFacingDto } from './dto/update-facing.dto';
import { Facing } from './schema/facing.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class FacingService {
  @InjectModel(Facing.name)
  private readonly facing: Model<Facing>;
  async create(createFacingDto: CreateFacingDto) {
    for (const item of createFacingDto.marca) {
      await this.facing.create({
        cantidad: createFacingDto.cantidad,
        exhibicion: createFacingDto.exhibicion,
        marca: new Types.ObjectId(item),
        sucursal: createFacingDto.sucursal,
      });
    }
    return 'This action adds a new facing';
  }


}

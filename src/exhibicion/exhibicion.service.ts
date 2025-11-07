import { ConflictException, Injectable } from '@nestjs/common';
import { CreateExhibicionDto } from './dto/create-exhibicion.dto';
import { UpdateExhibicionDto } from './dto/update-exhibicion.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Exhibicion } from './schema/exhibicion.schema';
import { Model } from 'mongoose';
import { flagEnum } from 'src/core-app/enum/coreEnum';

@Injectable()
export class ExhibicionService {
  @InjectModel(Exhibicion.name)
  private readonly exhibicion: Model<Exhibicion>;
  async create(createExhibicionDto: CreateExhibicionDto) {
    const exhibicion = await this.exhibicion.findOne({nombre:createExhibicionDto.nombre})
    if(exhibicion){
      throw new ConflictException("El nombre de exhibicion ya existe");
    }
    return this.exhibicion.create(createExhibicionDto);
  }

  findAll() {
    return this.exhibicion.find({flag:flagEnum.nuevo});
  }

  async gurardarExhibicion(nombre:string) {
    const exhibicion = await this.exhibicion.findOne({nombre:nombre})
    if(!exhibicion){
      return this.exhibicion.create({nombre:nombre})
    }
    return exhibicion
  }
}

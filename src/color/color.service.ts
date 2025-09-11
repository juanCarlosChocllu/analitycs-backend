import { Injectable } from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Color } from './schema/color.schema';
import { Model } from 'mongoose';


@Injectable()
export class ColorService {
    constructor(@InjectModel(Color.name)  private readonly  color:Model<Color> ){}
  async guardarColor(nombre:string){
    const color= await this.color.findOne({nombre:nombre.toUpperCase()})
    if(!color){
      return await this.color.create({nombre:nombre})
    } 
    return color
  }
}

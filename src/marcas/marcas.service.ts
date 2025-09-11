import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Marca } from './schema/marca.schema';
import { Model, Types } from 'mongoose';
import { AsignarCategoriaDto } from './dto/asignarCategoriaDto';

@Injectable()
export class MarcasService {
  constructor(
    @InjectModel(Marca.name)
    private readonly marcaSchema: Model<Marca>,
  ) {}
  public async guardarMarcaProducto(nombre: string) {
    const marca = await this.marcaSchema.exists({ nombre: nombre });
    if (!marca) {
      return this.marcaSchema.create({ nombre: nombre });
    }
    return marca;
  }

  public async listarMarcaProducto(nombre: string) {
    const marca = await this.marcaSchema.findOne({ nombre: nombre });
    return marca;
  }

  async listarMarcas() {
    return this.marcaSchema.find();
  }

  async asignarCategoriaMarca(asignarCategoriaDto: AsignarCategoriaDto) {
    const marca = await this.marcaSchema.findOne({
      _id: new Types.ObjectId(asignarCategoriaDto.marca),
    });
    if (!marca) {
      throw new NotAcceptableException();
    }
    return this.marcaSchema.updateOne(
      { _id: new Types.ObjectId(asignarCategoriaDto.marca) },
      { categoria: asignarCategoriaDto.categoria },
    );
  }
}

import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Marca } from './schema/marca.schema';
import { Model, Types } from 'mongoose';
import { AsignarCategoriaDto } from './dto/asignarCategoriaDto';
import * as ExcelJS from 'exceljs';
import { rutaArchivoUpload } from 'src/core-app/utils/coreAppUtils';

@Injectable()
export class MarcasService {
  constructor(
    @InjectModel(Marca.name)
    private readonly marca: Model<Marca>,
  ) {}
  public async guardarMarcaProducto(nombre: string) {
    const marca = await this.marca.exists({ nombre: nombre });
    if (!marca) {
      return this.marca.create({ nombre: nombre });
    }
    return marca;
  }

  public async listarMarcaProducto(nombre: string) {
    const marca = await this.marca.findOne({ nombre: nombre });
    return marca;
  }

  async listarMarcas() {
    return this.marca.find();
  }

  async asignarCategoriaMarca(asignarCategoriaDto: AsignarCategoriaDto) {
    const marca = await this.marca.findOne({
      _id: new Types.ObjectId(asignarCategoriaDto.marca),
    });
    if (!marca) {
      throw new NotAcceptableException();
    }
    return this.marca.updateOne(
      { _id: new Types.ObjectId(asignarCategoriaDto.marca) },
      { categoria: asignarCategoriaDto.categoria },
    );
  }

  async asignarCategoriaMarcas(archivo: string) {
    const ruta = rutaArchivoUpload(archivo);

    const workbook = new ExcelJS.stream.xlsx.WorkbookReader(ruta, {
      entries: 'emit',
    });
    let contador: number = 0;
    for await (const hojas of workbook) {
      for await (const hoja of hojas) {
        contador++;
        const id = hoja.getCell(1).value?.toString();
        const categoria = hoja.getCell(3).value?.toString();
        if(contador == 1){
          continue
        }
            
        if (id && categoria) {
          const marca = await this.marca.findOne({
            _id: new Types.ObjectId(id),
          });

          
          if (marca) {
            await this.marca.updateOne(
              { _id: new Types.ObjectId(id) },
              { $set: { categoria: categoria.toUpperCase() } },
            );
          }
        }
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Producto } from './schema/producto.schema';

import { Model, Types } from 'mongoose';
import { MarcasService } from 'src/marcas/marcas.service';
import { ColorService } from 'src/color/color.service';
import { TipoMontura } from 'src/tipo-montura/schema/tipo-montura.schema';
import { TipoMonturaService } from 'src/tipo-montura/tipo-montura.service';
import { Type } from 'class-transformer';
import { types } from 'util';

@Injectable()
export class ProductoService {
  constructor(
     @InjectModel(Producto.name) private readonly producto:Model<Producto>,
     private readonly marcarService :MarcasService,
     private readonly colorService :ColorService,
      private readonly tipoMonturaService :TipoMonturaService,

   ){}

   async crearProducto (codigoMia:string, marca :string ,rubro:string, tipoMontura:string, codigoQR:string, color:string ){
     const producto=  await this.producto.findOne({codigoMia:codigoMia})
     if(!producto){ 
         const ma = await this.marcarService.guardarMarcaProducto(marca)
        const data = {
          codigoMia:codigoMia,
          codigoQR:codigoQR,
          marca:ma._id,
          tipoProducto:rubro
        }
        if(color && color != ""){
          const co = await this.colorService.guardarColor(color)
          data["color"] = co._id
        }
        if(rubro === "MONTURA" && tipoMontura && tipoMontura != ""){
          const tipo =await this.tipoMonturaService.guardarTipoMontura(tipoMontura)
          data["tipoMontura"] = new Types.ObjectId(tipo._id)
        }
        return this.producto.create(data)
     }
     return producto
   }
}

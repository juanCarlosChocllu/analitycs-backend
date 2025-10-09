import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'Stock' })
export class Stock {
  @Prop()
  cantidad: number;

  @Prop({ type: Types.ObjectId, ref: 'Almacen' })
  almacen: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Sucursal' })
  sucursal: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Producto' })
  producto: Types.ObjectId;

  @Prop()
  tipo: string;

  @Prop()
  fechaDescarga: string;

  @Prop()
  codigoStock: string;
  
  @Prop({ type: Date })
  fechaCreacion: Date;
}

export const stockSchema = SchemaFactory.createForClass(Stock);
stockSchema.index({codigoStock:1})
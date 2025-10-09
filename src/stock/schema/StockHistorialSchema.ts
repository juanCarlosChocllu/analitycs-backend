import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Flag } from 'src/sucursal/enums/flag.enum';
import { StockHistorialI } from '../interface/stock';
import { BaseSchema } from 'src/core-app/schema/baseSchema';
import { Producto } from 'src/producto/schema/producto.schema';

@Schema({ collection: 'StockHistorial' })
export class StockHistorial extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'Almacen' })
  almacen: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Sucursal' })
  sucursal: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Producto' })
  producto: Types.ObjectId;

  @Prop()
  tipo: string;

  @Prop()
  cantidad: number;

  @Prop()
  fechaStock: Date;
}

export const StockHistorialSchema =
  SchemaFactory.createForClass(StockHistorial);
StockHistorialSchema.index({producto:1, fechaStock:1})
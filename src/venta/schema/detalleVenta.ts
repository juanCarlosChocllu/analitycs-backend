import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({ collection: 'DetalleVenta' })
export class DetalleVenta extends BaseSchema {
  @Prop()
  rubro: string;
  @Prop({ type: Types.ObjectId, ref: 'Venta' })
  venta: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Producto' })
  producto: Types.ObjectId;
  @Prop()
  importe: number;
  @Prop({ type: Types.ObjectId, ref: 'Receta' })
  receta: Types.ObjectId;
  @Prop()
  descripcion: string;
   @Prop()
  cantidad: number;
}
export const detalleVentaSchema = SchemaFactory.createForClass(DetalleVenta);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({collection:'DetalleCotizacion'})
export class DetalleCotizacion  extends BaseSchema{
  @Prop()
  rubro: string;
  @Prop()
  descripcion: string;
   @Prop()
  tipo: string;
  @Prop()
  cantidad: number;
  @Prop()
  importe: number;

  @Prop({type:Types.ObjectId, ref:'Receta'})
  receta: Types.ObjectId;

  @Prop({type:Types.ObjectId, ref:'Producto'})
  producto: Types.ObjectId;

  @Prop({type:Types.ObjectId, ref:'Cotizacion'})
  cotizacion:Types.ObjectId
}
export const detalleCotizacionSchema = SchemaFactory.createForClass(DetalleCotizacion);
detalleCotizacionSchema.index({cotizacion:1})
detalleCotizacionSchema.index({producto:1, rubro:1})

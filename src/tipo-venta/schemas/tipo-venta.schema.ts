import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({collection:'TipoVenta'})
export class TipoVenta  extends BaseSchema{
  @Prop()
  nombre: string;


}
export const TipoVentaSchema = SchemaFactory.createForClass(TipoVenta);

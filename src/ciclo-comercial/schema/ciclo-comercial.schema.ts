import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({ collection: 'CicloComercial' })
export class CicloComercial extends BaseSchema {
  @Prop()
  fechaInicio: Date;
  @Prop()
  fechaFin: Date;

  @Prop({ default: 0 })
  diasComerciales: number;

  @Prop({ default: 0 })
  orden: number;
}
export const CicloComercialSchema =
  SchemaFactory.createForClass(CicloComercial);

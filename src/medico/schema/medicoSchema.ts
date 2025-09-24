import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({ collection: 'Medico' })
export class Medico extends BaseSchema {
  @Prop()
  nombre: string;
  @Prop()
  especialidad: string;
}
export const medicoShema = SchemaFactory.createForClass(Medico);

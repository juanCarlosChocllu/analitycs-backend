import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({ collection: 'Asesor' })
export class Asesor extends BaseSchema {
  @Prop()
  nombre: string;

  @Prop({ type: Boolean, default: false })
  tieneUsuario: boolean;
}
export const asesorSchema = SchemaFactory.createForClass(Asesor);

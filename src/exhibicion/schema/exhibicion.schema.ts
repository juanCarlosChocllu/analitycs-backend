import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({ collection: 'Exhibicion' })
export class Exhibicion extends BaseSchema {
  @Prop()
  nombre: string;
}
export const exhibicionSchema = SchemaFactory.createForClass(Exhibicion);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({ collection: 'Facing' })
export class Facing extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'Exhibicion' })
  exhibicion: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Facing' })
  sucursal: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Marca' })
  marca: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  cantidad: number;
}
export const facingSchema = SchemaFactory.createForClass(Facing);

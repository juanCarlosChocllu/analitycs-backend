import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({ collection: 'DetalleMedico' })
export class DetalleMedico extends BaseSchema {
  @Prop({ ref: 'Medico' })
  medico: Types.ObjectId;
  @Prop()
  especialidad: string;

  @Prop({ ref: 'sucursal' })
  sucursal: Types.ObjectId;
}
export const detalleMedicoShema = SchemaFactory.createForClass(DetalleMedico);

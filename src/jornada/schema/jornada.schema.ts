import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({ collection: 'Jornada' })
export class Jornada extends BaseSchema {
  @Prop()
  fechaInicio: Date;
  @Prop()
  fechaFin: Date;
  @Prop({ default: 0 })
  diasLaborales: number;
  @Prop({ type: Types.ObjectId, ref: 'DetalleAsesor' })
  detalleAsesor: Types.ObjectId;

  @Prop()
  meses: number;

  @Prop()
  aqo: number;
}

export const JornadaSchema = SchemaFactory.createForClass(Jornada);
JornadaSchema.index({
  detalleAsesor: 1,
  fechaCreacion: 1,
  flag: 1,
  meses: 1,
  aqo: 1,
});

JornadaSchema.index({
  fechaInicio: 1,
  detalleAsesor: 1,
  flag: 1,
});

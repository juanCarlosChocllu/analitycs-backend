import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Flag } from 'src/sucursal/enums/flag.enum';

@Schema({ collection: 'RendimientoDiario' })
export class RendimientoDiario {
  @Prop({ type: Types.ObjectId, ref: 'DetalleAsesor' })
  detalleAsesor: Types.ObjectId;

  @Prop()
  atenciones: number;

  @Prop()
  segundoPar: number;
  @Prop()
  fechaDia: string;

  @Prop()
  presupuesto: number;

  @Prop({
    type: Date,
    default: function () {
      const date = new Date();
      date.setHours(date.getHours() - 4);
      return date;
    },
  })
  fecha: Date;

  @Prop({ type: String, enum: Flag, default: Flag.nuevo })
  flag: string;
}

export const rendimientoDiarioSchema =
  SchemaFactory.createForClass(RendimientoDiario);
rendimientoDiarioSchema.index({fechaDia:1, asesor:1,flag:1})


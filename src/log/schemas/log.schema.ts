import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { estadoLogEnum } from '../enum/estadoLog.enum';

@Schema({ collection: 'Log' })
export class Log {
  @Prop({ type: Types.ObjectId, ref: 'usuarios' })
  usuario: Types.ObjectId;

  @Prop()
  descripcion: string;

  @Prop()
  schema: string;

  @Prop()
  codigoError: string;

  @Prop()
  tipoError: string;

  @Prop({ type: String, enum: estadoLogEnum, default: estadoLogEnum.PENDIENTE })
  estado: string;

  @Prop()
  fechaFallida: string;

  @Prop({ type: Date, default: Date.now })
  fecha: Date;
}
export const logSchema = SchemaFactory.createForClass(Log);

@Schema({ collection: 'LogDescarga' })
export class LogDescarga {
  @Prop({ type: Types.ObjectId, ref: 'usuarios' })
  usuario: Types.ObjectId;
  @Prop()
  schema: string;

  @Prop()
  fechaDescarga: string;

  @Prop({ type: Date, default: Date.now })
  fecha: Date;
}
export const logDescargaSchema = SchemaFactory.createForClass(LogDescarga);

@Schema({ collection: 'LogIngresoUser' })
export class LogIngresoUser {
  @Prop()
  usuario: Types.ObjectId;
   @Prop()
  ip: string;
   @Prop()
  city: string;
   @Prop()
  region: string;
   @Prop()
  country: string;
   @Prop()
  loc: string;
   @Prop()
  org: string;
   @Prop()
  timezone: string;
   @Prop()
  readme: string;
}
export const LogIngresoUserSchema =
  SchemaFactory.createForClass(LogIngresoUser);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({ collection: 'Cotizacion' })
export class Cotizacion extends BaseSchema {
  @Prop()
  codigo: string;
 @Prop()
  noCompra: string;
  @Prop({ type: Types.ObjectId, ref: 'DetalleAsesor' })
  detalleAsesor: Types.ObjectId;

   @Prop({ type: Types.ObjectId, ref: 'DetalleAsesor' })
  detalleMedico: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Sucursal' })
  sucursal: Types.ObjectId;
  @Prop()
  total1: number;
  @Prop()
  total2: number;
  @Prop({ type: Date })
  fechaCotizacion: Date;
  @Prop()
  id_venta:string
  @Prop()
  recetaVenta:number

}
export const cotizacionSchema = SchemaFactory.createForClass(Cotizacion);
cotizacionSchema.index({sucursal:1,fechaCotizacion:1})
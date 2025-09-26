import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BaseSchema } from 'src/core-app/schema/baseSchema';

@Schema({ collection: 'Venta' })
export class Venta extends BaseSchema {
  @Prop()
  id_venta: string;
  @Prop()
  montoTotal: number;

  @Prop()
  montoTotalDescuento: number;
  @Prop({ type: Types.ObjectId, ref: 'Asesor' })
  detalleAsesor: Types.ObjectId;

  @Prop()
  descuento: number;

  @Prop()
  comisiona: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Sucursal' })
  sucursal: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TipoVenta' })
  tipoVenta: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'DetalleMedico' })
  detalleMedico: Types.ObjectId;

  @Prop()
  tipo: string;

  @Prop()
  tipo2: string;

  @Prop()
  nombrePromocion: string;

  @Prop()
  tipoDescuento: string;

  @Prop()
  descuentoPromocion: number;

  @Prop()
  descuentoPromocion2: number;

  @Prop({ type: Types.ObjectId, ref: 'Precio' })
  precio: Types.ObjectId;

  @Prop()
  estado: string;

  @Prop()
  fechaVenta: Date;

  @Prop()
  fechaFinalizacion: Date;

  @Prop({ type: Date })
  fechaAnulacion: Date;

  @Prop()
  estadoTracking: string;

  @Prop()
  flagVenta: string;

  @Prop({ type: String })
  tipoConversion: string;

  @Prop({ type: String })
  codigoConversion: string;

  @Prop({ type: Boolean })
  cotizacion: boolean;
}
export const ventaSchema = SchemaFactory.createForClass(Venta);
ventaSchema.index({id_venta:1})
ventaSchema.index({fechaVenta:1, estadoTracking:1})


ventaSchema.index({ sucursal: 1, fechaVenta: 1, tipoVenta: 1, comisiona: 1 });
ventaSchema.index({ sucursal: 1, fechaFinalizacion: 1, tipoVenta: 1, comisiona: 1 });

//indice de busqueda de recetas convertidas a ventas
ventaSchema.index({ codigoConversion: 1, cotizacion: 1, estadoTracking: 1 });



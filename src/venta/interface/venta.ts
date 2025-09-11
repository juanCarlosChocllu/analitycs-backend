import { PartialType } from '@nestjs/mapped-types';
import { Types } from 'mongoose';

export interface VentaI {
  id_venta: string;

  montoTotal: number;

  montoTotalDescuento: number;

  detalleAsesor: Types.ObjectId;

  descuento: number;

  comisiona: boolean;

  tieneReceta: boolean;

  tieneProducto: boolean;

  sucursal: Types.ObjectId;

  tipoVenta: Types.ObjectId;

  tipo: string;

  tipo2: string;

  nombrePromocion: string;

  tipoDescuento: string;

  descuentoPromocion: number;

  descuentoPromocion2: number;

  precio: Types.ObjectId;

  estado: string;

  fechaVenta: Date;

  fechaFinalizacion: Date;

  fechaAnulacion: Date;

  estadoTracking: string;
  flagVenta:string
}

export type VentaIOpcional = Partial<VentaI>;
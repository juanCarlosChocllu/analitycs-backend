import { Types } from 'mongoose';

export interface CotizacionI {
  codigo: string;
  detalleAsesor: Types.ObjectId;

  sucursal: Types.ObjectId;

  total1: number;

  total2: number;
  detalleMedico: Types.ObjectId;
  fechaCotizacion: Date;
  noCompra: string;
  id_venta?: string;
  recetaVenta?: number;
}
export interface DetalleCotizacionI {
  rubro: string;

  descripcion: string;

  cantidad: number;

  importe: number;

  tipo: string;

  receta?: Types.ObjectId;

  producto?: Types.ObjectId;

  cotizacion: Types.ObjectId;
}

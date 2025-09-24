import { Types } from 'mongoose';

export interface detalleVentaI {
  rubro: string;

  producto?: Types.ObjectId;

  importe: number;
  cantidad: number;
  receta?: Types.ObjectId;
  venta: Types.ObjectId;
  descripcion: string;
  medioPar?: boolean;
}

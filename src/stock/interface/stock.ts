import { Types } from 'mongoose';
import { StockMia } from 'src/providers/interface/stockMia';

export interface StockI {
  cantidad: number;

  almacen?: Types.ObjectId;

  sucursal?: Types.ObjectId;

  producto: Types.ObjectId;

  codigoStock: string;
  tipo: string;
  fechaDescarga:string
  fechaCreacion:Date
}

export interface StockProductoI {
  producto: Types.ObjectId;
  stock: StockMia[];
}


export interface StockHistorialI {
  cantidad:number,
  fecha:Date,
}
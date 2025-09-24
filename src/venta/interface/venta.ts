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
  flagVenta: string;

  tipoConversion: string;

  codigoConversion: string;

  cotizacion: boolean;

    detalleMedico: Types.ObjectId;
}

export type VentaIOpcional = Partial<VentaI>;

export interface CodigoMiaProductoI{
producto:Types.ObjectId,
codigoMia:string
}

export interface VentaRendimientoDiarioI {
  lente: number
  lc: number
  entregadas: number
  receta: Receum[]
  montoTotal: number
  asesorId: Types.ObjectId
  asesor: string
  fecha: string
  ticket:number
}

export interface Receum {
  descripcion: string
}
export interface resultadRendimientoDiarioI {
  metaTicket:number,
    diasComerciales:number,
  sucursal:string,
    metaMonto:number
  ventaAsesor:ventaAsesorI[]

}
export interface ventaAsesorI{
  asesor:string
  ventas:VentaRendimientoDiarioI[]
}


export interface FiltroVentaI {
  fechaVenta?: {
    $gte: Date;
    $lte: Date;
  };
  fechaFinalizacion?: {
    $gte: Date;
    $lte: Date;
  };
  tipoVenta?: Types.ObjectId | {$in :Types.ObjectId[] } ;
  flagVenta?: string | { $ne: string } | {$eq :string };
  comisiona?:boolean | null
  estadoTracking: { $ne: string }
 
}

export interface avanceLocalI {
  sucursal:string,
  metaTicket:string
  metaMonto:string
  ventas:ventaAvanceLocalI[]

}

export interface ventaAvanceLocalI 

    {
      ventasRelizadas:number,
      ventasFinalizadas:number,
      fecha:string
      asesores:Types.ObjectId[]
    }
  
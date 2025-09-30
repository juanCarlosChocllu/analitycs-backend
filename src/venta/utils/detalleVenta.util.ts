import { Types } from "mongoose";
import { DetalleVentaDto } from "../dto/DetalleVenta.dto";
import { FiltroVentaI } from "../interface/venta";
import { FlagVentaE } from "../enum/ventaEnum";

export function detallleVentaFilter(
  detalleVentaDto: DetalleVentaDto,
): FiltroVentaI {
  const filtrador: FiltroVentaI = {

      estadoTracking:{$ne:'ANULADO'}
  };

  if (detalleVentaDto.flagVenta === FlagVentaE.finalizadas) {
    filtrador.fechaFinalizacion = {
      $gte:detalleVentaDto.fechaInicio,
      $lte: detalleVentaDto.fechaFin
    };
  }

  if (detalleVentaDto.flagVenta === FlagVentaE.realizadas) {
    filtrador.fechaVenta = {
     $gte:detalleVentaDto.fechaInicio,
      $lte: detalleVentaDto.fechaFin
    };
  }

  if (detalleVentaDto.comisiona ) {
    filtrador.comisiona = detalleVentaDto.comisiona;
  }

  detalleVentaDto.tipoVenta.length > 0
    ? (filtrador.tipoVenta = {
        $in: detalleVentaDto.tipoVenta.map((id) => new Types.ObjectId(id)),
      })
    : filtrador;

    
  return filtrador;
}

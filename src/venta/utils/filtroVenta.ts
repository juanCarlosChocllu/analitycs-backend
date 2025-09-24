import { BuscadorRendimientoDiarioDto } from "src/rendimiento-diario/dto/BuscardorRendimientoDiario";


import { Types } from "mongoose";
import { FiltroVentaI } from "../interface/venta";
import { FlagVentaE } from "../enum/ventaEnum";

export function filtradorVenta(filtro: BuscadorRendimientoDiarioDto) {
  let filtrador: FiltroVentaI = {
   estadoTracking:{$ne:'ANULADO'}
  };

  if (filtro.flagVenta === FlagVentaE.finalizadas) {
    filtrador.fechaFinalizacion = {
        $gte: filtro.fechaInicio,
      $lte: filtro.fechaFin,
    };
  }

  if (filtro.flagVenta === FlagVentaE.realizadas) {
    filtrador.fechaVenta = {
      $gte: filtro.fechaInicio,
      $lte: filtro.fechaFin,
    };
  }

  if (filtro.comisiona != null) {
    filtrador.comisiona = filtro.comisiona;
  }
  filtro.tipoVenta.length > 0
    ? (filtrador.tipoVenta = {
        $in: filtro.tipoVenta.map((id) => new Types.ObjectId(id)),
      })
    : filtrador;

  return filtrador;
}

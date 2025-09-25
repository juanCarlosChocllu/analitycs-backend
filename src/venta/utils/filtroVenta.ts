import { BuscadorRendimientoDiarioDto } from "src/rendimiento-diario/dto/BuscardorRendimientoDiario";


import { Types } from "mongoose";
import { FiltroVentaI } from "../interface/venta";
import { FlagVentaE } from "../enum/ventaEnum";
import { BuscadorVentaDto } from "../dto/BuscadorVenta.dto";

export function filtradorVenta(filtro: BuscadorRendimientoDiarioDto | BuscadorVentaDto) {
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

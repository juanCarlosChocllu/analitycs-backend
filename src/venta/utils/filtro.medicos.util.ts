import { Types } from 'mongoose';
import { VentaMedicosDto } from '../dto/venta.medicos.dto';
import { FiltroVentaI } from '../interface/venta';
import { FlagVentaE } from '../enum/ventaEnum';


export function filtradorMedicos(filtro: VentaMedicosDto) {
  let filtrador: FiltroVentaI = {
       estadoTracking:{$ne:'ANULADO'}
  };

  if (filtro.flagVenta === FlagVentaE.finalizadas) {
    filtrador.fechaFinalizacion = {
      $gte: new Date(new Date(filtro.fechaInicio).setUTCHours(0, 0, 0, 0)),
      $lte: new Date(new Date(filtro.fechaFin).setUTCHours(23, 59, 59, 999)),
    };
  }

  if (filtro.flagVenta === FlagVentaE.realizadas) {
    
    filtrador.fechaVenta = {
      $gte: new Date(new Date(filtro.fechaInicio).setUTCHours(0, 0, 0, 0)),
      $lte: new Date(new Date(filtro.fechaFin).setUTCHours(23, 59, 59, 999)),
    };
  }

  if (filtro.comisiona != null) {
    filtrador.comisiona = filtro.comisiona;
  }
  if (filtro.especialidad != null) {
    filtrador.especialidad = filtro.especialidad;
  }
  filtro.tipoVenta.length > 0
    ? (filtrador.tipoVenta = {
        $in: filtro.tipoVenta.map((id) => new Types.ObjectId(id)),
      })
    : filtrador;
  return filtrador;
}

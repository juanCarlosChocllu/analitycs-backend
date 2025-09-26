import { Injectable } from '@nestjs/common';
import { Venta } from '../schema/venta.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { DetalleVenta } from '../schema/detalleVenta';
import { calcularPorcentaje, cantidadDias, cantidadDomingos, reglaDeTresSimple } from 'src/core-app/utils/coreAppUtils';
import { DiasService } from 'src/dias/services/dias.service';
import { DataMetaI } from '../interface/dataMeta';
import { Flag } from 'src/sucursal/enums/flag.enum';
import { BuscadorVentaDto } from '../dto/BuscadorVenta.dto';
import { filtradorVenta } from '../utils/filtroVenta';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { MetasSucursalService } from 'src/metas-sucursal/services/metas-sucursal.service';

@Injectable()
export class VentaMetasService {
 constructor(
    @InjectModel(Venta.name)
    private readonly venta: Model<Venta>,
     @InjectModel(DetalleVenta.name)
    private readonly detalleVenta: Model<DetalleVenta>,
        private readonly diasService: DiasService,
          private readonly sucursalService: SucursalService,
              private readonly metasSucursalService: MetasSucursalService,
      
  ) {}

    async metasDeVenta(ventaDto: BuscadorVentaDto) {
    const filtrador = filtradorVenta(ventaDto);
    const resultados: DataMetaI[] = [];

    const dias = cantidadDias(
      ventaDto.fechaInicio,
      ventaDto.fechaFin,
    );

    const domingos = cantidadDomingos(
      ventaDto.fechaInicio,
      ventaDto.fechaFin,
    );

    for (const sucursal of ventaDto.sucursal) {
      const suc = await this.sucursalService.listarSucursalId(sucursal);

      let diasComerciales = 0;
      const meta = await this.metasSucursalService.listarMetasSucursal(
        sucursal,
        ventaDto.fechaInicio
      );
      if (meta) {
        diasComerciales = meta.dias;
      }
      let [indiceDeAvanceComercial, diasHAbiles] =
        await this.indiceDeAvanceComercial(
          dias,
          sucursal,
          diasComerciales,
          domingos,
        );

      const venta = await this.venta.aggregate([
        {
          $match: {
            sucursal: new Types.ObjectId(sucursal),
            ...filtrador,
            flag: Flag.nuevo,
          },
        },
        {
          $lookup: {
            from: 'Sucursal',
            foreignField: '_id',
            localField: 'sucursal',
            as: 'sucursal',
          },
        },
        
      
        {
          $group: {
            _id: '$sucursal.nombre',
            ticket: {
              $sum: 1
            },
            importe: { $sum: '$montoTotalDescuento' },
            sucursal: { $first: '$sucursal.0.nombre' },
          },
        },
        {
          $project: {
            ticket: 1,
            importe: 1,
            sucursal: 1,
          },
        },
      ]);

      const ticketVenta = venta[0] ? venta[0].ticket : 0;
      const importVenta = venta[0] ? venta[0].importe : 0;

      const montoMeta = meta ? meta.monto : 0;
      const ticketMeta = meta ? meta.ticket : 0;
      const data: DataMetaI = {
        _id: suc._id,
        sucursal: suc.nombre,
        montoMeta: montoMeta,
        ticketMeta: ticketMeta,
        ticketVenta: ticketVenta,
        importVenta: importVenta,
        cumplimientoTicket: calcularPorcentaje(ticketVenta, ticketMeta),
        cumplimientoImporte: calcularPorcentaje(importVenta, montoMeta),
        indeceAvance: indiceDeAvanceComercial,
        diasHAbiles: diasHAbiles,
      };

      resultados.push(data);
    }

    return resultados;
  }


    private async indiceDeAvanceComercial(
    dias: Date[],
    sucursal: Types.ObjectId,
    diasComerciales: number,
    domingos: number,
  ) {
    let cantidadDiasHabiles: number = 0;
    let cantidadDiasInHabiles: number = 0;
    for (const dia of dias) {
      const diasHAbiles = await this.diasService.listarDiasHabiles(
        dia,
        sucursal,
      );
      const diasInHAbiles = await this.diasService.listarDiasInhabiles(
        dia,
        sucursal,
      );
      if (diasHAbiles) {
        cantidadDiasHabiles += 1;
      }
      if (diasInHAbiles) {
        cantidadDiasInHabiles += 1;
      }
    }
    let cantidadDias: number = dias.length - domingos;
    cantidadDias += cantidadDiasHabiles;
    cantidadDias -= cantidadDiasInHabiles;
    const avance = reglaDeTresSimple(
      diasComerciales,
      cantidadDias,
    );
    return [avance, cantidadDias];
  }



}

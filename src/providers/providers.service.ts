import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { HttpService } from '@nestjs/axios';
import { DescargarProviderDto } from './dto/DescargarProviderDto';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/core-app/config/appConfigService';
import {
  AnularVentaI,
  AnularVentaMiaI,
  CotizacionMIaI,
  FinalizarVentaMia,
  RecetaResponseI,
  VentaApiI,
} from './interface/ApiMia';
import { VentaI, VentaIOpcional } from 'src/venta/interface/venta';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { TipoVentaService } from 'src/tipo-venta/tipo-venta.service';
import { AsesorService } from 'src/asesor/asesor.service';
import { VentaService } from 'src/venta/service/venta.service';
import { Types } from 'mongoose';
import { detalleVentaI } from 'src/venta/interface/detalleVenta';
import { ProductoE } from 'src/core-app/enum/coreEnum';
import { ProductoService } from 'src/producto/producto.service';
import { TratamientoService } from 'src/tratamiento/tratamiento.service';
import { MaterialService } from 'src/material/material.service';
import { ColorLenteService } from 'src/color-lente/color-lente.service';
import { MarcaLenteService } from 'src/marca-lente/marca-lente.service';
import { RangosService } from 'src/rangos/rangos.service';
import { TipoColorService } from 'src/tipo-color/tipo-color.service';
import { TipoLenteService } from 'src/tipo-lente/tipo-lente.service';
import { horaUtc } from 'src/core-app/utils/coreAppUtils';
import { recetaI } from 'src/receta/interface/receta';
import { RecetaService } from 'src/receta/receta.service';
import { MedicoService } from 'src/medico/medico.service';
import { StockMia } from './interface/stockMia';
import { AxiosResponse } from 'axios';
import { StockService } from 'src/stock/stock.service';
import { CotizacionService } from 'src/cotizacion/cotizacion.service';
import {
  CotizacionI,
  DetalleCotizacionI,
} from 'src/cotizacion/interface/cotizacion';

import { Cron, CronExpression } from '@nestjs/schedule';
import { LogService } from 'src/log/log.service';
import { PrecioService } from 'src/precio/precio.service';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
    private readonly sucursalService: SucursalService,
    private readonly tipoVentaService: TipoVentaService,
    private readonly asesorService: AsesorService,
    private readonly ventaService: VentaService,
    private readonly productoService: ProductoService,
    private readonly tratamientoService: TratamientoService,
    private readonly materialService: MaterialService,
    private readonly colorLenteService: ColorLenteService,
    private readonly marcaLenteService: MarcaLenteService,
    private readonly rangoService: RangosService,
    private readonly TipoColorService: TipoColorService,
    private readonly tipoLenteService: TipoLenteService,
    private readonly recetaService: RecetaService,
    private readonly medicoService: MedicoService,
    private readonly stockService: StockService,
    private readonly cotizacionService: CotizacionService,
    private readonly logService: LogService,
       private readonly precioService: PrecioService,
  ) {}
  async descargarVentasMia(createProviderDto: DescargarProviderDto) {
    try {
      const data: DescargarProviderDto = {
        fechaFin: createProviderDto.fechaFin,
        fechaInicio: createProviderDto.fechaInicio,
        token: this.appConfigService.tokenMia,
      };
      await this.logService.registroLogDescarga(
        'Venta',
        createProviderDto.fechaFin,
      );
      const ventas = await firstValueFrom(
        this.httpService.post<VentaApiI[]>(
          `${this.appConfigService.apiMia}/api/ventas`,
          data,
        ),
      );

      return ventas.data;
    } catch (error) {
      throw error;
    }
  }

  async ventasFinalizadasMia(createProviderDto: DescargarProviderDto) {
    try {
      const data: DescargarProviderDto = {
        fechaFin: createProviderDto.fechaFin,
        fechaInicio: createProviderDto.fechaInicio,
        token: this.appConfigService.tokenMia,
      };
      const ventas = await firstValueFrom(
        this.httpService.post<FinalizarVentaMia[]>(
          `${this.appConfigService.apiMia}/api/ventas/finalizadas2`,
          data,
        ),
      );

      return ventas.data;
    } catch (error) {
      throw error;
    }
  }

  async anularVentasMia(createProviderDto: DescargarProviderDto) {
    try {
      const data: DescargarProviderDto = {
        fechaFin: createProviderDto.fechaFin,
        fechaInicio: createProviderDto.fechaInicio,
        token: this.appConfigService.tokenMia,
      };
      const ventas = await firstValueFrom(
        this.httpService.post<AnularVentaMiaI[]>(
          `${this.appConfigService.apiMia}/api/ventas/anuladas`,
          data,
        ),
      );     
      return ventas.data;
    } catch (error) {
      throw error;
    }
  }

  async finalizarVentas(descargarProviderDto: DescargarProviderDto) {
    const ventas = await this.ventasFinalizadasMia(descargarProviderDto);
    for (const venta of ventas) {
      await this.ventaService.finalizarVentasCron(venta);
    }
  }

  public async descargarRecetaMia(
    createProviderDto: DescargarProviderDto,
  ): Promise<RecetaResponseI[]> {
    const body: DescargarProviderDto = {
      fechaFin: createProviderDto.fechaFin,
      fechaInicio: createProviderDto.fechaInicio,
      token: this.appConfigService.tokenMia,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.appConfigService.apiMia}/api/recetas/medico`,
          body,
        ),
      );

      return response.data;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async descargarReceta(descargarDto: DescargarProviderDto) {
    const receta = await this.descargarRecetaMia(descargarDto);
    for (const data of receta) {
      const medico = await this.medicoService.guardarMedico(data.medico);

      const detalle = await this.medicoService.guardarDetalleMedico(
        medico._id,
        data.especialidad,
      );

      const nuevaReceta: recetaI = {
        ...data,
        fecha: horaUtc(data.fecha),
        detalleMedico: new Types.ObjectId(detalle._id),
      };
      await this.recetaService.regitrarReceta(nuevaReceta);
    }
  }
  async descargarCotizacionesMia(createProviderDto: DescargarProviderDto) {
    try {
      const data: DescargarProviderDto = {
        fechaFin: createProviderDto.fechaFin,
        fechaInicio: createProviderDto.fechaInicio,
        token: this.appConfigService.tokenMia,
      };
      const ventas = await firstValueFrom(
        this.httpService.post<CotizacionMIaI[]>(
          `${this.appConfigService.apiMia}/api/cotizaciones/v1`,
          data,
        ),
      );

      return ventas.data;
    } catch (error) {
      throw error;
    }
  }

  async anularVentas(createProviderDto: DescargarProviderDto) {
    const ventas = await this.anularVentasMia(createProviderDto);
    for (const venta of ventas) {
      const data: AnularVentaI = {
        estado: venta.estado,
        estadoTracking: venta.estadoTracking,
        fechaAnulacion: venta.fechaAprobacionAnulacion,
        id_venta: venta.id_venta.toUpperCase(),
      };

      await this.ventaService.anularVenta(data);
    }
    return { status: HttpStatus.OK };
  }
  async descargarStockMia(producto: string[]): Promise<StockMia[]> {
    try {
      const data = {
        producto: producto,
        token: this.appConfigService.tokenMia,
      };
      const stock: AxiosResponse<StockMia[]> = await firstValueFrom(
        this.httpService.post(
          `${this.appConfigService.apiMia}/api/stock`,
          data,
        ),
      );
      return stock.data;
    } catch (error) {
      throw error;
    }
  }

  async guardardataVenta(createProviderDto: DescargarProviderDto) {
    try {
      let ventaGuardar: VentaIOpcional = {};
      const ventas: VentaApiI[] =
        await this.descargarVentasMia(createProviderDto);
      for (const data of ventas) {
        const sucursal = await this.sucursalService.guardarSucursalVenta(
          data.local,
        );
        if (sucursal) {
          const [asesor, tipoVenta, medico, precio] = await Promise.all([
            this.asesorService.guardarAsesor(data.nombre_vendedor),
            this.tipoVentaService.guardarTipoVenta(data.tipoVenta),
            this.medicoService.guardarMedico(data.medico),
            this.precioService.guardarTipoPrecio(data.precio.toUpperCase())
          ]);
          const detalleMedico = await this.medicoService.guardarDetalleMedico(
            medico._id,
            data.especialidad,
            // sucursal._id
          );
          const detalleAsesor = await this.asesorService.guardarDetalleAsesor(
            asesor._id,
            sucursal._id,
          );
          ventaGuardar = {
            detalleAsesor: detalleAsesor._id,
            comisiona: data.comisiona,
            descuento: data.descuentoFicha,
            id_venta: data.idVenta,
            montoTotal: data.precioTotal,
            sucursal: sucursal._id,
            tipoVenta: tipoVenta._id,
            estadoTracking: data.estadoTracking,
            descuentoPromocion: data.descuentoPromosion,
            descuentoPromocion2: data.descuentoPromosion2,
            nombrePromocion: data.nombrePromosion,
            tipo: data.tipo,
            tipo2: data.tipo2,
            tipoDescuento: data.tipoDescuento,
            flagVenta: data.flag,
            montoTotalDescuento: data.monto_total,
            precio: precio._id,
            cotizacion: data.cotizacion,
            codigoConversion: data.numeroCotizacion,
            tipoConversion: data.tipoConversion,
            fechaVenta: horaUtc(data.fecha),
            detalleMedico: detalleMedico._id,
            ...(data.fecha_finalizacion && {
              fechaFinalizacion: horaUtc(data.fecha_finalizacion),
            }),
          };
          const venta = await this.ventaService.guardarVenta(ventaGuardar);
          if (data.rubro === ProductoE.lente) {
            await this.guardarLente(
              data,
              sucursal._id,
              venta._id,
              detalleMedico._id,
            );
          } else if (
            data.rubro === ProductoE.gafa ||
            data.rubro === ProductoE.lenteDeContacto ||
            data.rubro === ProductoE.montura
          ) {
            await this.guardarProducto(data, venta._id);
          } else if (data.rubro == ProductoE.servicio) {
            await this.guardarServicio(data, venta._id);
          } else {
            await this.guardarOtroProducto(data, venta._id);
          }
        } else {
          console.log('sin sucursal');
        }
      }

      return { status: HttpStatus.CREATED };
    } catch (error) {
      throw error;
    }
  }

  private async guardarOtroProducto(data: VentaApiI, venta: Types.ObjectId) {
    const detalle: detalleVentaI = {
      cantidad: 1,
      importe: data.importe,
      rubro: data.rubro,
      venta: venta._id,
      descripcion: data.descripcionProducto,
    };
    await this.ventaService.guardarDetalleVenta(detalle);
  }

  private async guardarServicio(data: VentaApiI, venta: Types.ObjectId) {
    const detalle: detalleVentaI = {
      cantidad: 1,
      importe: data.importe,
      rubro: data.rubro,
      venta: venta._id,
      descripcion: data.descripcionProducto,
    };
    await this.ventaService.guardarDetalleVenta(detalle);
  }
  private async guardarProducto(data: VentaApiI, venta: Types.ObjectId) {
    const producto = await this.productoService.crearProducto(
      data.codProducto,
      data.atributo1,
      data.rubro,
      data.atributo4,
      data.atributo6,
      data.atributo5,
    );
    const detalle: detalleVentaI = {
      cantidad: 1,
      importe: data.importe,
      rubro: data.rubro,
      venta: venta._id,
      descripcion: data.descripcionProducto,
      producto: new Types.ObjectId(producto._id),
    };
    await this.ventaService.guardarDetalleVenta(detalle);
  }

  private async guardarLente(
    data: VentaApiI,
    sucursal: Types.ObjectId,
    venta: Types.ObjectId,
    detalleMedico: Types.ObjectId,
  ) {
    const [
      coloLente,
      tipoLente,
      material,
      tipoColorLente,
      marca,
      tratamiento,
      rango,
    ] = await Promise.all([
      this.colorLenteService.guardarColorLente(data.atributo1),
      this.tipoLenteService.guardarTipoLente(data.atributo2),
      this.materialService.guardarMaterial(data.atributo3),
      this.TipoColorService.guardarTipoColor(data.atributo4),
      this.marcaLenteService.guardarMarcaLente(data.atributo5),
      this.tratamientoService.guardarTratamiento(data.atributo6),
      this.rangoService.guardarRango(data.atributo7),
    ]);

    const nuevaReceta: recetaI = {
      ...data.receta,
      fecha: horaUtc(data.receta.fecha),
      detalleMedico: detalleMedico,
      colorLente: coloLente._id,
      marcaLente: marca._id,
      material: material._id,
      rango: rango._id,
      tipoColor: tipoColorLente._id,
      tipoLente: tipoLente._id,
      tratamiento: tratamiento._id,
      sucursal: new Types.ObjectId(sucursal),
    };
    const receta = await this.recetaService.regitrarReceta(nuevaReceta);
    const detalle: detalleVentaI = {
      cantidad: 1,
      importe: data.importe,
      rubro: data.rubro,
      receta: receta._id,
      descripcion: data.descripcionProducto,
      medioPar: data.medioPar,
      venta: venta,
    };
    await this.ventaService.guardarDetalleVenta(detalle);
  }

  async descargarStockProductos(descargarProviderDto: DescargarProviderDto) {
    const ventas =
      await this.ventaService.buscarProductoDeVenta(descargarProviderDto);

    const stock = await this.descargarStockMia(
      ventas.map((item) => item.codigoMia),
    );
    await this.stockService.guardarStockMia(stock, ventas);
  }

  async descargarCotizacion(descargarProviderDto: DescargarProviderDto) {
    const cotizaciones =
      await this.descargarCotizacionesMia(descargarProviderDto);

    for (const cot of cotizaciones) {
      const [sucursal, asesor, medico] = await Promise.all([
        this.sucursalService.guardarSucursalVenta(cot.sucursal),
        this.asesorService.guardarAsesor(cot.asesor.toUpperCase()),
        this.medicoService.guardarMedico(cot.medico),
      ]);
      const detalleAsesor = await this.asesorService.guardarDetalleAsesor(
        asesor._id,
        sucursal._id,
      );
      const detalleMedico = await this.medicoService.guardarDetalleMedico(
        medico.id,
        cot.especialidad,
      );
      const dataCotizacion: CotizacionI = {
        codigo: cot.codigo,
        detalleAsesor: detalleAsesor._id,
        fechaCotizacion: horaUtc(cot.fecha),
        sucursal: sucursal._id,
        total1: cot.total1 ? cot.total1 : 0,
        total2: cot.total2 ? cot.total2 : 0,
        noCompra: cot.motivoNoCompra,
         ...(cot.id_venta && { id_venta: cot.id_venta }),
        detalleMedico: detalleMedico._id,
        ...(cot.id_venta && { id_venta: cot.id_venta }),
        ...(cot.recetaVenta && { recetaVenta: cot.recetaVenta }),
      };
      const cotizacion =
        await this.cotizacionService.guardarCotizacion(dataCotizacion);
      if (cot.detalle.length > 0) {
        for (const p of cot.detalle) {
          const producto = await this.productoService.crearProducto(
            p.codigoProduto,
            p.marca,
            p.rubro,
            p.tipoProducto,
            p.codigoQR,
            p.color,
          );
          const detalle: DetalleCotizacionI = {
            cantidad: p.cantidad,
            cotizacion: cotizacion._id,
            descripcion: p.descripcion,
            importe: p.importe,
            rubro: p.rubro,
            tipo: p.rubro,
            producto: producto._id,
          };
          await this.cotizacionService.guardaDetalleCotizacion(detalle);
        }
      }

      if (cot.detalleReceta2.length > 0) {
        const [
          coloLente,
          tipoLente,
          material,
          tipoColorLente,
          marca,
          tratamiento,
          rango,
        ] = await Promise.all([
          this.colorLenteService.guardarColorLente(
            cot.detalleReceta1[0].colorLente,
          ),
          this.tipoLenteService.guardarTipoLente(
            cot.detalleReceta1[0].tipoLente,
          ),
          this.materialService.guardarMaterial(cot.detalleReceta1[0].material),
          this.TipoColorService.guardarTipoColor(
            cot.detalleReceta1[0].tipoColorLente,
          ),
          this.marcaLenteService.guardarMarcaLente(
            cot.detalleReceta1[0].marcaLente,
          ),
          this.tratamientoService.guardarTratamiento(
            cot.detalleReceta1[0].tratamiento,
          ),
          this.rangoService.guardarRango(cot.detalleReceta1[0].rango),
        ]);

        const nuevaReceta: recetaI = {
          ...cot.detalleReceta1[0],
          fecha: horaUtc(cot.detalleReceta1[0].fecha),
          detalleMedico: detalleMedico._id,
          colorLente: coloLente._id,
          marcaLente: marca._id,
          material: material._id,
          rango: rango._id,
          tipoColor: tipoColorLente._id,
          tipoLente: tipoLente._id,
          tratamiento: tratamiento._id,
          sucursal: new Types.ObjectId(sucursal._id),
        };
        const receta = await this.recetaService.regitrarReceta(nuevaReceta);
        const detalle: DetalleCotizacionI = {
          cantidad: 1,
          cotizacion: cotizacion._id,
          descripcion: cot.descripcion1,
          importe: cot.detalleReceta1[0].importe,
          rubro: 'LENTE',
          tipo: 'LENTE 1',
          receta: receta._id,
        };
        await this.cotizacionService.guardaDetalleCotizacion(detalle);
      }

      if (cot.detalleReceta2.length > 0) {
        const [
          colorLente,
          tipoLente,
          material,
          tipoColorLente,
          marca,
          tratamiento,
          rango,
        ] = await Promise.all([
          this.colorLenteService.guardarColorLente(
            cot.detalleReceta2[0].colorLente,
          ),
          this.tipoLenteService.guardarTipoLente(
            cot.detalleReceta2[0].tipoLente,
          ),
          this.materialService.guardarMaterial(cot.detalleReceta2[0].material),
          this.TipoColorService.guardarTipoColor(
            cot.detalleReceta2[0].tipoColorLente,
          ),
          this.marcaLenteService.guardarMarcaLente(
            cot.detalleReceta2[0].marcaLente,
          ),
          this.tratamientoService.guardarTratamiento(
            cot.detalleReceta2[0].tratamiento,
          ),
          this.rangoService.guardarRango(cot.detalleReceta2[0].rango),
        ]);

        const nuevaReceta: recetaI = {
          ...cot.detalleReceta2[0],
          fecha: horaUtc(cot.detalleReceta2[0].fecha),
          detalleMedico: detalleMedico._id,
          colorLente: colorLente._id,
          marcaLente: marca._id,
          material: material._id,
          rango: rango._id,
          tipoColor: tipoColorLente._id,
          tipoLente: tipoLente._id,
          tratamiento: tratamiento._id,
          sucursal: new Types.ObjectId(sucursal._id),
        };
        const receta = await this.recetaService.regitrarReceta(nuevaReceta);
        const detalle: DetalleCotizacionI = {
          cantidad: 1,
          cotizacion: cotizacion._id,
          descripcion: cot.descripcion2,
          importe: cot.detalleReceta2[0].importe,
          rubro: 'LENTE',
          tipo: 'LENTE 2',
          receta: receta._id,
        };
        await this.cotizacionService.guardaDetalleCotizacion(detalle);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async finalizarVentasCron() {
    const hoy = new Date();

    const fechaFinDate = new Date(hoy);
    fechaFinDate.setDate(hoy.getDate() - 1);

    const fechaInicioDate = new Date(hoy);
    fechaInicioDate.setDate(hoy.getDate() - 2);

    const formatearFecha = (fecha: Date): string => {
      const año = fecha.getFullYear();
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const dia = fecha.getDate().toString().padStart(2, '0');
      return `${año}-${mes}-${dia}`;
    };

    const fecha: DescargarProviderDto = {
      fechaInicio: formatearFecha(fechaInicioDate),
      fechaFin: formatearFecha(fechaFinDate),
    };
    this.logger.debug('Iniciando las finalizaciones');
    await this.finalizarVentas(fecha);
  }
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async anularVentasCron() {
    try {
      const hoy = new Date();
      const fechaFinDate = new Date(hoy);
      fechaFinDate.setDate(hoy.getDate() - 1);

      const fechaInicioDate = new Date(hoy);
      fechaInicioDate.setDate(hoy.getDate() - 5);

      const formatearFecha = (fecha: Date): string => {
        const año = fecha.getFullYear();
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const dia = fecha.getDate().toString().padStart(2, '0');
        return `${año}-${mes}-${dia}`;
      };

      const fecha: DescargarProviderDto = {
        fechaInicio: formatearFecha(fechaInicioDate),
        fechaFin: formatearFecha(fechaFinDate),
      };

      this.logger.debug('Iniciando la anulaciones');
      const response = await this.anularVentas(fecha);
      console.log(fecha);
    } catch (error) {
      console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async descargaRecetas() {
    try {
      const date = new Date();

      const fechaAyer = new Date(date);
      fechaAyer.setDate(date.getDate() - 1);

      const año = fechaAyer.getFullYear();
      const mes = (fechaAyer.getMonth() + 1).toString().padStart(2, '0');
      const dia = fechaAyer.getDate().toString().padStart(2, '0');

      const fecha: DescargarProviderDto = {
        fechaInicio: `${año}-${mes}-${dia}`,
        fechaFin: `${año}-${mes}-${dia}`,
      };

      this.logger.debug('Iniciando la descarga recetas');
      const response = await this.descargarReceta(fecha);
      console.log(fecha);
    } catch (error) {
      console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async descargarVentasCron() {
    const date = new Date();

    const fechaAyer = new Date(date);
    fechaAyer.setDate(date.getDate() - 1);

    const año = fechaAyer.getFullYear();
    const mes = (fechaAyer.getMonth() + 1).toString().padStart(2, '0');
    const dia = fechaAyer.getDate().toString().padStart(2, '0');

    const fecha: DescargarProviderDto = {
      fechaInicio: `${año}-${mes}-${dia}`,
      fechaFin: `${año}-${mes}-${dia}`,
    };
    this.logger.debug('Iniciando la descarga');
    await this.guardardataVenta(fecha);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async descargarCotizacionesCron() {
    const date = new Date();

    const fechaAyer = new Date(date);
    fechaAyer.setDate(date.getDate() - 1);

    const año = fechaAyer.getFullYear();
    const mes = (fechaAyer.getMonth() + 1).toString().padStart(2, '0');
    const dia = fechaAyer.getDate().toString().padStart(2, '0');

    const fecha: DescargarProviderDto = {
      fechaInicio: `${año}-${mes}-${dia}`,
      fechaFin: `${año}-${mes}-${dia}`,
    };
    this.logger.debug('Iniciando la descarga');
    await this.descargarCotizacion(fecha);
  }

 
}

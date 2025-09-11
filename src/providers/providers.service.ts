import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { HttpService } from '@nestjs/axios';
import { DescargarProviderDto } from './dto/DescargarProviderDto';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/core-app/config/appConfigService';
import { VentaApiI } from './interface/ApiMia';
import { VentaI, VentaIOpcional } from 'src/venta/interface/venta';
import { SucursalService } from 'src/sucursal/sucursal.service';
import { TipoVentaService } from 'src/tipo-venta/tipo-venta.service';
import { AsesorService } from 'src/asesor/asesor.service';
import { VentaService } from 'src/venta/venta.service';
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

@Injectable()
export class ProvidersService {
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
  ) {}
  async descargarVentasMia(createProviderDto: DescargarProviderDto) {
    try {
      const data: DescargarProviderDto = {
        fechaFin: createProviderDto.fechaFin,
        fechaInicio: createProviderDto.fechaInicio,
        token: this.appConfigService.tokenMia,
      };
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

  async guardardataVenta(createProviderDto: DescargarProviderDto) {
    try {
      console.log('descargando venta');

      let ventaGuardar: VentaIOpcional = {};
      const ventas: VentaApiI[] =
        await this.descargarVentasMia(createProviderDto);
      for (const data of ventas) {
        const sucursal = await this.sucursalService.guardarSucursalVenta(
          data.local,
        );
        console.log(sucursal);

        if (sucursal) {
          const [asesor, tipoVenta] = await Promise.all([
            this.asesorService.guardarAsesor(data.nombre_vendedor),
            this.tipoVentaService.guardarTipoVenta(data.tipoVenta),
          ]);
          const detalleAsesor = await this.asesorService.guardarDetalleAsesor(
            asesor._id,
            sucursal._id,
          );

          ventaGuardar = {
            detalleAsesor: detalleAsesor._id,
            comisiona: data.comisiona,
            descuento: data.descuentoFicha,
            id_venta: data.idVenta,
            montoTotal: data.monto_total,
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
            montoTotalDescuento: data.precioTotal,
            precio: tipoVenta._id, // se veridica en cada venta

            fechaVenta: new Date(data.fecha),
            ...(data.fecha_finalizacion && {
              fechaFinalizacion: new Date(data.fecha_finalizacion),
            }),
          };
          const venta = await this.ventaService.guardarVenta(ventaGuardar);
          console.log(venta);

          if (data.rubro === ProductoE.lente) {
            //await this.guardarLente(data, venta._id);
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

  private async guardarLente(data: VentaApiI, venta:Types.ObjectId) {
  
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
  }
}

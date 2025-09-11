export interface VentaApiI {
  fecha: string;
  idVenta: string;
  apertura_tkt: number;
  local: string;
  codProducto: string;
  atributo1: string;
  atributo2: string;
  atributo3: string;
  atributo4: string;
  atributo5: string;
  atributo6: string;
  atributo7: string;
  rubro: string;
  descripcionProducto: string;
  cantidad: number;
  importe: number;
  descuentoFicha: number;
  monto_total: number;
  cod_vendedor: string;
  nombre_vendedor: string;
  comisiona: boolean;
  medico: string;
  especialidad: string;
  estadoTracking: string;
  numeroCotizacion: string;
  cotizacion: boolean;
  tipoVenta: string;
  fecha_finalizacion: string;
  flag: string;

  tipo: string;

  tipo2: string;

  nombrePromosion: string;

  tipoDescuento: string;

  descuentoPromosion: number;

  descuentoPromosion2: number;

  precio:string
  precioTotal:number
  medioPar:boolean
  receta:RecetaResponseI
}



export interface AnularVentaMiaI{
    id_venta:string
    estado:string,
    estadoTracking:string
    fechaAprobacionAnulacion:string
}
export interface FinalizarVentaMia{
    id_venta:string
    estado:string,
    estadoTracking:string
    flaVenta:string
    fecha_finalizacion:string
}

export interface RecetaResponseI {
  codigoMia: string;
  medico: string;
  codigoReceta: string;
  especialidad: string;
  esfericoLejosD: string;
  esfericoLejosI: string;
  esfericoCercaD: string;
  esfericoCercaI: string;

  cilindricoLejosD: string;
  cilindricoLejosI: string;
  cilindricoCercaD: string;
  cilindricoCercaI: string;

  ejeLejosD: string;
  ejeLejosI: string;
  ejeCercaD: string;
  ejeCercaI: string;

  altura: string;

  distanciaLejosD: string;
  distanciaLejosI: string;
  distanciaCercaD: string;
  distanciaCercaI: string;

  dpLejos: string;
  dpCerca: string;

  addLejos: string;
  addCerca: string;

  fecha: string;

  observacion: string;
  tipo: string;
  tipoLenteTexto: string;
  tipoCreacion: string;

  recomenacionLentePrincipal: string;
  recomenacionLenteComplementario: string;
  recomendacionProteccionDeSol: string;
  recomendacionLenteDeContacto: string;

  lcEsferaOd: string;
  lcCilindroOd: string;
  lcEjeOd: string;
  lcCurvaBaseOd: string;
  lcDiametroOd: string;

  lcEsferaOi: string;
  lcCilindroOi: string;
  lcEjeOi: string;
  lcCurvaBaseOi: string;
  lcDiametroOi: string;
}
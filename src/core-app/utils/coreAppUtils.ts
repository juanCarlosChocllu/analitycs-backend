 import { eachDayOfInterval, isSunday } from 'date-fns';
 import * as path from 'path';
 export function  horaUtc(fecha: string) {
    const fechaDate = new Date(fecha);
    fechaDate.setHours(fechaDate.getHours() - 4);
    return fechaDate;
  }
  export function formaterFechaHora(fechaInicio: string, fechaFin: string) {
  const f1 = new Date(fechaInicio);
  f1.setUTCHours(0, 0, 0, 0);
  const f2 = new Date(fechaFin);
  f2.setUTCHours(23, 59, 59, 999);
  return { f1, f2 };
}

export function skip (pagina:number, limite:number) {
    return (pagina - 1) * limite  
}
export function calcularPaginas(countDocuments: number, limite: number): number {
  return Math.ceil(countDocuments / limite);
}

 export function cantidadDias(fechaInicio: Date, fechaFin: Date): Date[] {
    const fecha1 = new Date(fechaInicio);
    fecha1.setUTCDate(fecha1.getUTCDate() + 1);
    const fecha2 = new Date(fechaFin);
    fecha2.setUTCDate(fecha2.getUTCDate() + 1);
    const dias = eachDayOfInterval({ start: fecha1, end: fecha2 });
    return dias;
  }

  export function reglaDeTresSimple(diasComerciales: number, diasHabiles: number): number {
    if (diasComerciales <= 0 || diasHabiles <= 0) {
      return 0;
    }
    const indice = (diasHabiles * 100) / diasComerciales;
    return Math.round(indice);
  }

  export function cantidadDomingos(fechaInicio: Date, fechaFin: Date) {
    const fecha1 = new Date(fechaInicio);
    fecha1.setUTCDate(fecha1.getUTCDate() + 1);
    const fecha2 = new Date(fechaFin);
    fecha2.setUTCDate(fecha2.getUTCDate() + 1);
    const dias = eachDayOfInterval({ start: fecha1, end: fecha2 });
    const domingos = dias.filter((dia) => isSunday(dia));
    return domingos.length;
  }

  export function calcularPorcentaje(cantidad:number, total:number):number{
      if(cantidad <= 0  || total <= 0){
        return 0
      }
      const porcentaje = (cantidad / total) * 100;
    
      
      return Math.round(porcentaje)

}

export function ticketPromedio(totalVenta: number, cantidadTotaVenta: number) {
    const tkPromedio = totalVenta / cantidadTotaVenta;    
    return tkPromedio ? parseFloat(tkPromedio.toFixed(2)) : 0;
  }

  export function diasHAbiles(fechaInicio: Date, fechaFin: Date) {

  const dias = eachDayOfInterval({ start: fechaInicio, end: fechaFin });
  const diasHAbiles = dias.filter((dia) => !isSunday(dia));

  return diasHAbiles.length;
}

export function tasaConversion(totalConvertidos:number,totalVisitantes:number ):number{
    if(totalVisitantes <= 0  || totalConvertidos <= 0){
        return 0
      }
    const resultado = (totalConvertidos/totalVisitantes) * 100
    return Math.round(resultado)
}



  export function rutaArchivoUpload(archivo: string) {
    let ruta: string = path.join(__dirname, `../../../upload/${archivo}`);
    return ruta;
  }
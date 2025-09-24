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
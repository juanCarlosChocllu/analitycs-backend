export function formatearFechaVentaStr(fecha: string) {
  const [anio, mes, dia] = fecha.split('-');
  const mesFormateada = mes.padStart(2, '0');
  const diaFormateada = dia.padStart(2, '0');
  return `${anio}-${mesFormateada}-${diaFormateada}`;
}

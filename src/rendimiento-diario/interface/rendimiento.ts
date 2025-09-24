import { Types } from "mongoose"

export interface rendimientoI{
    montoTotalVentas:number,
    atenciones:number,
    cantidadLente:number,
    antireflejos:number,
    progresivos:number,
    lc:number,
    entregas:number
    asesor:string
    fecha:string
    idAsesor:Types.ObjectId
    segundoPar:number
    ticket:number
}


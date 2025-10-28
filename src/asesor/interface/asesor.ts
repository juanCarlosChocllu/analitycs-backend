import { Types } from "mongoose";

export interface  asesorYsucursalI {
      _id: Types.ObjectId;
      nombre: string;
      sucursalNombre: string;
      idSucursal: Types.ObjectId;
    }
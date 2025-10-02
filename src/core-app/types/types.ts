
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      usuario:{
        idUsuario:Types.ObjectId,
        detalleAsesor:Types.ObjectId | null
        rol:string
    
      }
      
    }
  }
}

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({collection:"DetalleAsesor"})
export class DetalleAsesor {
      @Prop({ type: Types.ObjectId, ref: 'Asesor' })
    asesor:Types.ObjectId
      @Prop({ type: Types.ObjectId, ref: 'Sucursal' })
    sucursal:Types.ObjectId
}
 export const detalleAsesorSchema = SchemaFactory.createForClass(DetalleAsesor)


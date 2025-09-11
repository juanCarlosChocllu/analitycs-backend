import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Types } from "mongoose"
import { BaseSchema } from "src/core-app/schema/baseSchema"


@Schema({collection:'Producto'})
export class Producto  extends BaseSchema{
    @Prop()
    codigoMia:string
    @Prop()
    tipoProducto:string
    @Prop()
    marca:Types.ObjectId
    @Prop()
    serie:string
    @Prop()
    color:Types.ObjectId
    @Prop()
    tipoMontura:Types.ObjectId
    @Prop()
    codigoQR:string

}
export const  productoSchema = SchemaFactory.createForClass(Producto)
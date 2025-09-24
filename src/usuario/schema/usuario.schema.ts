import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Flag } from "src/sucursal/enums/flag.enum";



@Schema({collection:'Usuario'})
export class Usuario {

    @Prop()
    nombre:string

    @Prop()
    apellidos:string

    @Prop()
    username:string
    
    @Prop({select:false})
    password:string

    @Prop({type:Types.ObjectId, ref:'Asesor'})
    asesor:Types.ObjectId

    @Prop({type:Types.ObjectId, ref:'DetalleAsesor'})
    detalleAsesor:Types.ObjectId

    @Prop()
    rol:string
    
    @Prop({type:String, enum:Flag, default:Flag.nuevo})
    flag:string



}

export const usuariosSchema = SchemaFactory.createForClass(Usuario)
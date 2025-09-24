import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import {  Types } from "mongoose"
import { BaseSchema } from "src/core-app/schema/baseSchema"

@Schema({collection:'DiasMetasSucursal'})
export class DiasMetasSucursal extends BaseSchema {
   

    @Prop({type:Types.ObjectId, ref :'Sucursal'})
    metasSucursal:Types.ObjectId
    
    @Prop()
    metaDia:Date  

   
}

export const diasMetasSucursalSchema = SchemaFactory.createForClass(DiasMetasSucursal)


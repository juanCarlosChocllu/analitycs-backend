import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseSchema } from "src/core-app/schema/baseSchema";

@Schema({collection:"Trafico"})
export class Trafico extends BaseSchema{
    @Prop({type:Types.ObjectId, ref:'Sucursal'})
    sucursal:Types.ObjectId
}

export const TraficoSchema = SchemaFactory.createForClass(Trafico)
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseSchema } from "src/core-app/schema/baseSchema";

@Schema({collection:'Almacen'})
export class Almacen extends BaseSchema {
    @Prop()
    nombre:string
}
export const almacenSchema = SchemaFactory.createForClass(Almacen)
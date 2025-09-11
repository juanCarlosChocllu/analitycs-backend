import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "src/core-app/schema/baseSchema";

@Schema({collection:'Marca'})
export class Marca extends BaseSchema {
    @Prop()
    nombre:string

    @Prop()
    categoria:string
}


export const marcaSchema= SchemaFactory.createForClass(Marca)

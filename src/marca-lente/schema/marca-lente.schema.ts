import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "src/core-app/schema/baseSchema";

@Schema({collection:'MarcaLente'})
export class MarcaLente extends  BaseSchema{
    @Prop()
    nombre:string
}
export const MarcaLenteSchema= SchemaFactory.createForClass(MarcaLente)
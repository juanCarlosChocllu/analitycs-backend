import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "src/core-app/schema/baseSchema";

@Schema({collection:"Asesor"})
export class Asesor extends BaseSchema {
    @Prop()
    nombre:string
}
 export const asesorSchema = SchemaFactory.createForClass(Asesor)


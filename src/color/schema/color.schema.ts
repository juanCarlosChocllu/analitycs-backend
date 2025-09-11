import { SchemaFactory } from "@nestjs/mongoose";
import { Prop, Schema } from "@nestjs/mongoose/dist/decorators";
import { BaseSchema } from "src/core-app/schema/baseSchema";

@Schema({collection:'Color'})
export class Color extends BaseSchema {
       @Prop()
        nombre:string
    
}
export const colorSchema = SchemaFactory.createForClass(Color)

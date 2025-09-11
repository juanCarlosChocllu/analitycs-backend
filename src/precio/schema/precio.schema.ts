import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "src/core-app/schema/baseSchema";

@Schema({ collection: 'Precio' })
export class Precio extends BaseSchema {
@Prop()
  nombre: string;
}

export const PrecioSchema = SchemaFactory.createForClass(Precio);
PrecioSchema.index({nombre:1})
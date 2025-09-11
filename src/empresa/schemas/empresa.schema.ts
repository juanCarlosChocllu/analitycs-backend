import { Prop, SchemaFactory,Schema } from "@nestjs/mongoose";
import { BaseSchema } from "src/core-app/schema/baseSchema";


@Schema({collection:'Empresa'})
export class Empresa  extends BaseSchema{
  @Prop()
  nombre: string;
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa);
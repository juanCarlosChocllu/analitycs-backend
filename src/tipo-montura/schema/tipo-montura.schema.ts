import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@Schema({collection:'TipoMontura'})
export class TipoMontura {
    @Prop()
    nombre:string
    
}

export const tipoMonturaSchema = SchemaFactory.createForClass(TipoMontura)
import { Transform } from "class-transformer"
import { IsMongoId, IsNotEmpty, IsString } from "class-validator"
import { Types } from "mongoose"

export class AsignarCategoriaDto{
    @IsNotEmpty()
    @IsString()
    @Transform(({value}:{value:string})=> value.trim().toUpperCase())
    categoria:string

    @IsNotEmpty()
    @IsMongoId()
    marca:Types.ObjectId
}
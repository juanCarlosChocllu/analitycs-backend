import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class DescargarProviderDto {

    @IsDateString()
    @IsNotEmpty()
    fechaInicio:string

    @IsDateString()
    @IsNotEmpty()
    fechaFin:string

    @IsString()
    @IsOptional()

    token?:string
}
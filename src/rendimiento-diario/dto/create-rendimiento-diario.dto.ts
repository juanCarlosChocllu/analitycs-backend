import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateRendimientoDiarioDto {

    @IsNumber()
    @IsNotEmpty()
    atenciones:number

    @IsNumber()
    @IsNotEmpty()
    segundoPar:number

    @IsNumber()
    @IsNotEmpty()
    presupuesto:number
}

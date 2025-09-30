import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { FlagVentaE } from "../enum/estado.enum";
import { BuscadorVentaDto } from "./BuscadorVenta.dto";

export class BuscadorVentaLenteDto extends BuscadorVentaDto{
    @IsMongoId({each: true })
    @IsOptional()
    empresa: string[];
}
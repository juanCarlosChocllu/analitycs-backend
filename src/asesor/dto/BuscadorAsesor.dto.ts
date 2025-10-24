import { IsOptional, IsString } from "class-validator";
import { PaginadorCoreDto } from "src/core-app/dto/PaginadorCoreDto";
import { BaseSchema } from "src/core-app/schema/baseSchema";

export class BuscadorAsesorDto extends PaginadorCoreDto {
    @IsOptional()
    @IsString()
    nombre:string
}
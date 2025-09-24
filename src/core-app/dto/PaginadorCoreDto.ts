import { Transform } from "class-transformer";
import {IsNumber, IsNumberString, IsOptional, IsString } from "class-validator"

export class PaginadorCoreDto {

      @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limite: number = 20;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  pagina: number = 1;

}
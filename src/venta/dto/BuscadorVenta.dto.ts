import {
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { FlagVentaE } from '../enum/ventaEnum';
import { Transform } from 'class-transformer';

export class BuscadorVentaDto {
  @IsMongoId({ each: true })
  sucursal: Types.ObjectId[];

  @IsMongoId({ each: true })
  @IsOptional()
  tipoVenta: Types.ObjectId[];

  @IsEnum(FlagVentaE)
  @IsNotEmpty()
  flagVenta: string;

  @IsString({ each: true })
  @IsOptional()
  @IsArray()
  rubro: string[];

  @IsOptional()
  @IsBoolean()
  comisiona: boolean;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => {
    const date = new Date(value);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  })
  fechaInicio: Date;

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => {
    console.log(value);

    const date = new Date(value);
    date.setUTCHours(23, 59, 59);
    return date;
  })
  fechaFin: Date;
}

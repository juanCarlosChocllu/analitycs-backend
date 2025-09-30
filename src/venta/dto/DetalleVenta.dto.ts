import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Types } from 'mongoose';
import { FlagVentaE } from '../enum/ventaEnum';

export class DetalleVentaDto {
  @IsMongoId({ each: true })
  @IsOptional()
  tipoVenta: Types.ObjectId[];

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
    const date = new Date(value);
    date.setUTCHours(23, 59, 59);
    return date;
  })
  fechaFin: Date;

  @IsEnum(FlagVentaE)
  @IsNotEmpty()
  flagVenta: string;
}

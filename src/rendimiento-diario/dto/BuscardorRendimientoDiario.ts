import { Transform } from 'class-transformer';
import {
  IsArray,
  isArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  isMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Types } from 'mongoose';
import { FlagVentaE } from 'src/venta/enum/ventaEnum';

export class BuscadorRendimientoDiarioDto  {
  @IsMongoId({ each: true })
  @IsNotEmpty()
  sucursal: Types.ObjectId[];

  @IsMongoId({ each: true })
  @IsOptional()
  asesor: Types.ObjectId[];

  @IsMongoId({ each: true })
  @IsArray()
  tipoVenta: Types.ObjectId[];

  @IsNotEmpty()
  @IsEnum(FlagVentaE)
  flagVenta: string;

  @IsOptional()
  @IsBoolean()
  comisiona: boolean ;
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
}

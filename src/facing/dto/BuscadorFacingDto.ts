import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import { Types } from 'mongoose';

export class BuscadorFacingDto {
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

  @IsMongoId({ each: true })
  @IsArray()
  @ArrayMinSize(0)
  sucursal: Types.ObjectId[];
}

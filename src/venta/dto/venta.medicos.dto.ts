import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { BuscadorVentaDto } from './BuscadorVenta.dto';
import { Types } from 'mongoose';

export class VentaMedicosDto extends BuscadorVentaDto {
  @IsMongoId({ each: true })
  @IsOptional()
  empresa: Types.ObjectId[];

  @IsOptional()
  @IsString()
  especialidad: string;

  @IsOptional()
  @IsString()
  medico: string;
}

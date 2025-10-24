import { IsDateString, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';


export class CreateJornadaDto {
  @IsDateString()
  @IsNotEmpty()
  fechaInicio: Date;

  @IsDateString()
  @IsNotEmpty()
  fechaFin: Date;

  @IsMongoId()
  detalleAsesor: Types.ObjectId;
}

import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateFacingDto {
  @IsMongoId()
  @IsNotEmpty()
  exhibicion: Types.ObjectId;

 @IsMongoId({ each: true })
  @ArrayMinSize(0)
  @IsArray()
  sucursal: Types.ObjectId[];

  @IsMongoId({ each: true })
  @ArrayMinSize(0)
  @IsArray()
  marca: Types.ObjectId[];

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  cantidad: number;
}

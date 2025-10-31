import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateExhibicionDto {
    @IsNotEmpty()
    @IsString()
      @Transform(({value}:{value:string})=> value.toUpperCase().trim())
    nombre:string
}


import { PartialType } from '@nestjs/mapped-types';
import { CreateDiaDto } from './create-dia.dto';

export class UpdateDiaDto extends PartialType(CreateDiaDto) {}

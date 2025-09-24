
import { PartialType } from '@nestjs/mapped-types';
import { CreateRendimientoDiarioDto } from './create-rendimiento-diario.dto';

export class UpdateRendimientoDiarioDto extends PartialType(CreateRendimientoDiarioDto) {}

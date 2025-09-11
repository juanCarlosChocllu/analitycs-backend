
import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoMonturaDto } from './create-tipo-montura.dto';

export class UpdateTipoMonturaDto extends PartialType(CreateTipoMonturaDto) {}

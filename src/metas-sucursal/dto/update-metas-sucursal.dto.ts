
import { PartialType } from '@nestjs/mapped-types';
import { CreateMetasSucursalDto } from './create-metas-sucursal.dto';

export class UpdateMetasSucursalDto extends PartialType(CreateMetasSucursalDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateFacingDto } from './create-facing.dto';

export class UpdateFacingDto extends PartialType(CreateFacingDto) {}

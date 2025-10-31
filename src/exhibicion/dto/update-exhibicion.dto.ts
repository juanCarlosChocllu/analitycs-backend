import { PartialType } from '@nestjs/mapped-types';
import { CreateExhibicionDto } from './create-exhibicion.dto';

export class UpdateExhibicionDto extends PartialType(CreateExhibicionDto) {}

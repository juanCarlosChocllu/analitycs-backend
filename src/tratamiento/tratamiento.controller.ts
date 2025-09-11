import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TratamientoService } from './tratamiento.service';

@Controller('tratamiento')
export class TratamientoController {
  constructor(private readonly tratamientoService: TratamientoService) {}


}

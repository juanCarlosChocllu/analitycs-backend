import {
  Controller,
  Res,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { AutenticacionDto } from './dto/create-autenticacion.dto';
import { Publico } from './decorators/publico';
import type { Response } from 'express';
@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  @Post()
  @Publico()
  async create(@Body() AutenticacionDto: AutenticacionDto) {
    try {
   /*   const {token}= await this.autenticacionService.autenticacion(AutenticacionDto)
       if (token) {
        res.cookie('ctx', token, {
          httpOnly: true,
          secure: true,  Cambiar a true en producción con HTTPS
          maxAge: 1000 * 60 * 60 * 4,
          sameSite: 'strict',
          path: '/',
        });
        return res.json({ status: HttpStatus.OK });
      }*/
      return this.autenticacionService.autenticacion(AutenticacionDto)
    } catch (error) {
    throw error;
    } 
  }
}

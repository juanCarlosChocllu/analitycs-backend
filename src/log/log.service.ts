import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Log, LogDescarga, LogIngresoUser } from './schemas/log.schema';
import { Request } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IpInfoData } from './interface/log';
import { AppConfigService } from 'src/core-app/config/appConfigService';
import { UsuarioService } from 'src/usuario/usuario.service';
@Injectable()
export class LogService {
  constructor(
    @InjectModel(LogIngresoUser.name)
    private readonly logIngresoUser: Model<LogIngresoUser>,
    @InjectModel(LogDescarga.name)

    private readonly logDescarga: Model<LogDescarga>,
    private readonly usuarioService: UsuarioService,

  ) {}

  public async registroLogDescarga(schema: string, fechaDescarga: string) {
    return this.logDescarga.create({
      schema: schema,
      fechaDescarga: fechaDescarga,
    });
  }

  public async listarLogdescarga() {
    return this.logDescarga.find().limit(1).sort({ fechaDescarga: -1 });
  }

  public async registarLogIngresoUser(request: Request, ip: string) {  
    if (ip == '127.0.0.1' || ip == "::1") {
      return
    }
      const user= await this.usuarioService.buscarUsuaurio(request.body.username)
      return this.logIngresoUser.create({ip:ip, usuario: request.body.username , tipo:user ? "conocido" : "desconocido"});
  }
}

import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Log, LogDescarga, LogIngresoUser } from './schemas/log.schema';
import { Request } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IpInfoData } from './interface/log';
import { AppConfigService } from 'src/core-app/config/appConfigService';
@Injectable()
export class LogService {
  constructor(
    @InjectModel(LogIngresoUser.name)
    private readonly logIngresoUser: Model<LogIngresoUser>,
    @InjectModel(LogDescarga.name)

    private readonly logDescarga: Model<LogDescarga>,
    private readonly HttpService: HttpService,

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

  public async registarLogIngresoUser(request: Request, ip: string, token:string) {  
    if (ip == '127.0.0.1' || ip == "::1") {
      return
    }
    const response = await firstValueFrom(
        this.HttpService.get<IpInfoData>(`https://ipinfo.io/${ip}`, {
          headers:{
            Authorization:`Bearer ${token}`
          }
        }),
      );      
      const data: IpInfoData = {
        ...response.data,
        usuario: request.body.username,
      };
      return this.logIngresoUser.create(data);
  }
}

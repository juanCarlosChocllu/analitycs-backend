import { Injectable } from '@nestjs/common';

import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Log, LogDescarga } from './schemas/log.schema';

@Injectable()
export class LogService {
  constructor(
    @InjectModel(Log.name) private readonly logSchema: Model<Log>,
    @InjectModel(LogDescarga.name)
    private readonly logDescarga: Model<LogDescarga>,
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
}

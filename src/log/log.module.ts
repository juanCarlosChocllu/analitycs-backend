import { forwardRef, Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Log,
  LogDescarga,
  logDescargaSchema,
  LogIngresoUser,
  LogIngresoUserSchema,
  logSchema,
} from './schemas/log.schema';
import { HttpModule } from '@nestjs/axios';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports: [
    HttpModule,
    UsuarioModule,
    MongooseModule.forFeature([
      {
        name: Log.name,
        schema: logSchema,
      },
      {
        name: LogDescarga.name,
        schema: logDescargaSchema,
      },
      {
        name: LogIngresoUser.name,
        schema: LogIngresoUserSchema,
      },
    ]),
  ],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}

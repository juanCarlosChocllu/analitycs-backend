import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogDescarga, logDescargaSchema, logSchema } from './schemas/log.schema';


@Module({
  imports:[
    MongooseModule.forFeature(
      [
        {
          name: Log.name,
          schema: logSchema,
        },
        {
          name: LogDescarga.name,
          schema: logDescargaSchema,
        },
      ]
    ),
  ],
  controllers: [LogController],
  providers: [LogService],
  exports:[LogService]
})
export class LogModule {}

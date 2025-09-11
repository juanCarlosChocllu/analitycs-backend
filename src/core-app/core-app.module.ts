import { Module } from '@nestjs/common';
import { AppConfigService } from './config/appConfigService';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [AppConfigService],
  exports:[AppConfigService]
})
export class CoreAppModule {}

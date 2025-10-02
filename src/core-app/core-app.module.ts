import { Module } from '@nestjs/common';
import { AppConfigService } from './config/appConfigService';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerBehindProxyGuard } from './guards/ThrottlerBehindProxy.Guard';
import { LogService } from 'src/log/log.service';
import { LogModule } from 'src/log/log.module';

@Module({
  imports:[
    LogModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [AppConfigService, ThrottlerBehindProxyGuard],
  exports:[AppConfigService, ThrottlerBehindProxyGuard]
})
export class CoreAppModule {}

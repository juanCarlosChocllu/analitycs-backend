import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './core-app/config/appConfigService';
import  cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix("api/v2/")

  const appConfig = app.get(AppConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      
    }),
    
  );
    app.enableCors({
    origin: [appConfig.getRutaFronted],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
    app.use(cookieParser());
 app.set('trust proxy', 1);
  await app.listen(appConfig.port, () => {
    console.log(`servidor corriendo en el puerto:${appConfig.port}`);
  });
}
bootstrap();

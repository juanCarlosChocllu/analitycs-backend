import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './core-app/config/appConfigService';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api")
  const appConfig = app.get(AppConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await app.listen(appConfig.port, () => {
    console.log(`servidor corriendo en el puerto:${appConfig.port}`);
  });
}
bootstrap();

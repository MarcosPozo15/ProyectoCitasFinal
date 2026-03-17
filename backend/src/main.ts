import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { APP_DEFAULTS } from './common/constants/app.constants';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('Bootstrap');

  const port = Number(process.env.PORT || APP_DEFAULTS.PORT);
  const apiPrefix = process.env.API_PREFIX || APP_DEFAULTS.API_PREFIX;
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';

  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  await app.listen(port);

  logger.log(`API escuchando en http://localhost:${port}/${apiPrefix}`);
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Error arrancando la aplicación', error);
  process.exit(1);
});
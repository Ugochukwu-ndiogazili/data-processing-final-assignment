import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { FormatResponseInterceptor } from './common/interceptors/format-response.interceptor';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // CORS
    app.enableCors({
      origin: configService.get<string>('FRONTEND_URL'),
      credentials: true,
    });

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Response format negotiation (JSON/XML/CSV)
    app.useGlobalInterceptors(new FormatResponseInterceptor());

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false, // Changed to false to avoid blocking requests
      }),
    );

    // Global prefix
    app.setGlobalPrefix('api');

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('StreamFlix API')
      .setDescription('StreamFlix streaming platform API documentation')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addApiKey(
        { type: 'apiKey', in: 'header', name: 'x-internal-key' },
        'internalKey',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'StreamFlix API Documentation',
    });

    const port = parseInt(configService.get<string>('PORT') || '5000', 10);
    // Bind explicitly to IPv4 so host->container port mapping works reliably.
    await app.listen(port, '0.0.0.0');
    console.log(`StreamFlix API running on http://localhost:${port}`);
  } catch (error) {
    console.error('Error starting NestJS application:', error);
    process.exit(1);
  }
}
bootstrap();

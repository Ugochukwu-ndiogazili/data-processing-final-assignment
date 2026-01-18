import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { ContentModule } from './modules/content/content.module';
import { ViewingModule } from './modules/viewing/viewing.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { InternalModule } from './modules/internal/internal.module';
import { ExternalModule } from './modules/external/external.module';
import { ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      ignoreEnvFile: true, // Use environment variables from docker-compose.yml
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{
          ttl: (config.get<number>('RATE_LIMIT_WINDOW_MIN', 15) * 60) * 1000,
          limit: config.get<number>('RATE_LIMIT_MAX', 120),
        }],
      }),
    }),
    PrismaModule,
    CommonModule,
    AuthModule,
    ProfilesModule,
    ContentModule,
    ViewingModule,
    SubscriptionsModule,
    InternalModule,
    ExternalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


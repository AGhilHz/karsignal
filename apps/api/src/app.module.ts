import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { redisStore } from 'cache-manager-redis-yet';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SalariesModule } from './modules/salaries/salaries.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { CommunityModule } from './modules/community/community.module';
import { LayoffsModule } from './modules/layoffs/layoffs.module';
import { AiModule } from './modules/ai/ai.module';
import { AdminModule } from './modules/admin/admin.module';
import { StorageModule } from './modules/storage/storage.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { HealthModule } from './common/health/health.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Throttler (rate limiting)
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('THROTTLE_TTL', 60),
            limit: config.get('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    // Events
    EventEmitterModule.forRoot(),

    // Scheduler
    ScheduleModule.forRoot(),

    // Redis Cache - optional, skip if Redis not available
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        try {
          return {
            store: await redisStore({
              socket: {
                host: config.get('REDIS_HOST', 'localhost'),
                port: config.get<number>('REDIS_PORT', 6379),
              },
              password: config.get('REDIS_PASSWORD') || undefined,
              ttl: 300,
            }),
          };
        } catch {
          // Fallback to in-memory cache if Redis not available
          return { ttl: 300 };
        }
      },
    }),

    // BullMQ Queues - requires Redis
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD') || undefined,
          enableOfflineQueue: true,
          maxRetriesPerRequest: null,
          retryStrategy: (times: number) => Math.min(times * 100, 3000),
        },
      }),
    }),

    // Elasticsearch
    ElasticsearchModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        node: config.get('ELASTICSEARCH_NODE', 'http://localhost:9200'),
        auth: {
          username: config.get('ELASTICSEARCH_USERNAME', 'elastic'),
          password: config.get('ELASTICSEARCH_PASSWORD', 'elasticpassword'),
        },
      }),
    }),

    // Core modules
    PrismaModule,
    StorageModule,
    NotificationsModule,
    SearchModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProfilesModule,
    CompaniesModule,
    JobsModule,
    ReviewsModule,
    SalariesModule,
    InterviewsModule,
    CommunityModule,
    LayoffsModule,
    AiModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}

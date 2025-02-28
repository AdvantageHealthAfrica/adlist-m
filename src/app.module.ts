import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PharmaciesModule } from './pharmacies/pharmacies.module';
import { UniversalListModule } from './universal-list/universal-list.module';
import { SearchModule } from './search/search.module';
import { HealthModule } from './health/health.module';
import { CaslModule } from './casl/casl.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(
          configService.get<string>('NODE_ENV') === 'production' ? 'RDS_HOSTNAME' : 'DB_HOST',
        ),
        port: configService.get<number>(
          configService.get<string>('NODE_ENV') === 'production' ? 'RDS_PORT' : 'DB_PORT',
        ),
        username: configService.get<string>(
          configService.get<string>('NODE_ENV') === 'production' ? 'RDS_USERNAME' : 'DB_USERNAME',
        ),
        password: configService.get<string>(
          configService.get<string>('NODE_ENV') === 'production' ? 'RDS_PASSWORD' : 'DB_PASSWORD',
        ),
        database: configService.get<string>(
          configService.get<string>('NODE_ENV') === 'production' ? 'RDS_DB_NAME' : 'DB_NAME',
        ),
        autoLoadEntities: true,
        synchronize: true,
        logger: 'advanced-console',
      }),
    }),
    UsersModule,
    AuthModule,
    PharmaciesModule,
    UniversalListModule,
    SearchModule,
    HealthModule,
    CaslModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

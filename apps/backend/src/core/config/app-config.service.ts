import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRES: string = '15m';

  @IsString()
  JWT_REFRESH_EXPIRES: string = '7d';

  @IsString()
  PORT: string = '3001';
}

@Injectable()
export class AppConfigService implements OnModuleInit {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const required = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    for (const key of required) {
      if (!this.configService.get<string>(key)) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }

  get databaseUrl(): string {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get jwtAccessSecret(): string {
    return this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  get jwtAccessExpires(): string {
    return this.configService.get<string>('JWT_ACCESS_EXPIRES', '15m');
  }

  get jwtRefreshExpires(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES', '7d');
  }

  get port(): number {
    return Number(this.configService.get<string>('PORT', '3001'));
  }
}

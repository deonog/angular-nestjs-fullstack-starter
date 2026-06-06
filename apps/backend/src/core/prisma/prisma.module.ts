import { Global, Module } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: (config: AppConfigService) => PrismaService.create(config),
      inject: [AppConfigService],
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}

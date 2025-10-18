import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config'

@Module({
  imports: [NestConfigModule.forRoot({envFilePath: '.env'})],
  providers: [ConfigService],
  exports: [ConfigService]
})
export class ConfigModule {}

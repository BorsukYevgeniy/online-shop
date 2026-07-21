import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();

      this.logger.debug('Connected to database');
    } catch (e) {
      if (e instanceof PrismaClientInitializationError) {
        this.logger.fatal('Error connecting to database: ' + e.message);
      } else {
        this.logger.fatal(
          'Unexpected error connecting to database: ' + e.stack,
        );
      }
      throw e;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();

      this.logger.debug('Disconnected from database');
    } catch (e) {
      this.logger.fatal('Unexpected error disconnecting from database');
      throw e;
    }
  }
}

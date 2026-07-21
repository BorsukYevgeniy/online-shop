import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DeletingCount } from '../../common/types/deleting-count.type';
import { TokenRepository } from './token.repository';

@Injectable()
export class TokenCleaningService {
  private readonly logger: Logger = new Logger(TokenCleaningService.name);

  constructor(private readonly tokenRepository: TokenRepository) {}

  @Cron('0 0 1 * *')
  async cleanExpiredTokens(): Promise<void> {
    try {
      const result: DeletingCount =
        await this.tokenRepository.deleteExpiredTokens();

      this.logger.log(`Deleted ${result.count} expired tokens`);
    } catch (error) {
      this.logger.error('Error during token cleanup', {
        message: (error as Error).message,
      });
    }
  }
}

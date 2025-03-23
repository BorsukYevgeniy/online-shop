import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TokenRepository } from './token.repository';
import DeletingCount from 'src/types/deleting-count.type';

@Injectable()
export class TokenCleaningService {
  constructor(private readonly tokenRepository: TokenRepository) {}

  @Cron('0 0 1 * *')
  async cleanExpiredTokens(): Promise<void> {
    const result: DeletingCount =
      await this.tokenRepository.deleteExpiredTokens();

    console.log(`Deleted ${result.count} expired tokens`);
  }
}

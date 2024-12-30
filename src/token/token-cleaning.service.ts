import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TokenRepository } from './token.repository';

@Injectable()
export class TokenCleaningService {
  constructor(private readonly tokenRepository: TokenRepository) {}

  @Cron('0 0 1 * *')
  async cleanExpiredTokens(): Promise<void> {
    const now = new Date();
    const result = await this.tokenRepository.deleteExpiredTokens(now);
    console.log(`Deleted ${result.count} expired tokens`);
  }
}

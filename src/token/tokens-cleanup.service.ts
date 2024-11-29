import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TokensRepository } from './tokens.repository';

@Injectable()
export class TokenCleanupService {
  constructor(private readonly tokenRepository: TokensRepository) {}

  @Cron('0 0 1 * *')
  async cleanExpiredTokens() {
    const now = new Date();
    const result = await this.tokenRepository.deleteExpiredTokens(now);
    console.log(`Deleted ${result.count} expired tokens`);
  }
}

import { Injectable, Logger } from '@nestjs/common';

import { Cron } from '@nestjs/schedule';
import { UserRepository } from './user.repository';

@Injectable()
export class UserCleaningService {
  private readonly logger: Logger = new Logger(UserCleaningService.name);

  constructor(private readonly userRepository: UserRepository) {}

  @Cron('0 0 */3 * *')
  async deleteUnverifiedUsers() {
    try {
      const { count } = await this.userRepository.deleteUnverifiedUsers();

      this.logger.log(`Deleted ${count} unverified users`);
    } catch (error) {
      this.logger.error('Error during token cleanup', {
        message: error.message,
      });
    }
  }
}

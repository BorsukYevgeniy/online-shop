import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  UserNoPassword,
  UserNoCred,
  PaginatedUserNoCreds,
} from './types/user.types';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { User } from '@prisma/client';
import { SortUserDto } from './dto/sort-user.dto';

import { UserErrorMessages as UserErrMsg } from './constants/user-error-messages.constants';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async getAll(
    paginationDto: PaginationDto,
    sortUserDto: SortUserDto,
    searchDto: SearchUserDto,
  ): Promise<PaginatedUserNoCreds> {
    const { page, pageSize }: PaginationDto = paginationDto;
    const skip: number = pageSize * (page - 1);

    const [users, total] = await Promise.all([
      this.userRepository.findAll(skip, pageSize, sortUserDto, searchDto),
      this.userRepository.count(searchDto),
    ]);

    const totalPages: number = Math.ceil(total / pageSize);

    this.logger.log('Users fetched successfully, total: ' + total);

    return {
      users,
      total,
      page,
      pageSize,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  async getById(userId: number): Promise<UserNoCred> {
    const user: UserNoCred | null = await this.userRepository.findById(userId);

    if (!user) {
      this.logger.warn(`User ${userId} doesnt exist`);
      throw new NotFoundException(UserErrMsg.UserNotFound);
    }

    this.logger.log(`User ${userId} fetched successfully`);
    return user;
  }

  async getMe(userId: number): Promise<UserNoPassword> {
    const user = await this.userRepository.findUserProfile(userId);

    if (!user) {
      this.logger.warn(`User ${userId} doesnt exist`);
      throw new NotFoundException(UserErrMsg.UserNotFound);
    }

    this.logger.log(`User ${userId} fetched successfully`);
    return user;
  }

  async getByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOneByEmail(email);

    if (!user) {
      this.logger.warn(`User with email ${email} doesnt exist`);
    } else {
      this.logger.log(`User with email ${email} fetched successfully`);
      return user;
    }
  }

  async getByVerificationLink(verificationLink: string): Promise<User | null> {
    const user =
      await this.userRepository.findOneByVerificationLink(verificationLink);

    if (!user) {
      this.logger.warn(
        `User with verification link ${verificationLink} doesnt exist`,
      );
    } else {
      this.logger.log(
        `User with verification link ${verificationLink} fetched successfully`,
      );
      return user;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserNoPassword> {
    try {
      const user = await this.userRepository.create(createUserDto);

      this.logger.log(`User ${user.id} created successfully`);
      return user;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(
          `User with ${e.meta.target} ${createUserDto[e.meta.target as string]} already exists`,
        );
        throw new BadRequestException(
          UserErrMsg.UserAlreadyExists(e.meta.target as string),
        );
      }
    }
  }

  async delete(userId: number): Promise<void> {
    try {
      await this.userRepository.delete(userId);

      this.logger.log(`User ${userId} deleted successfully`);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(`User ${userId} doesnt exist`);
        throw new NotFoundException(UserErrMsg.UserNotFound);
      }
    }
  }

  async assignAdmin(userId: number): Promise<UserNoCred> {
    const candidate: UserNoCred = await this.userRepository.findById(userId);

    if (!candidate) {
      this.logger.warn(`User ${userId} doesnt exist`);
      throw new NotFoundException(UserErrMsg.UserNotFound);
    }

    const user = await this.userRepository.assignAdmin(userId);

    this.logger.log(`User ${userId} assigned as admin successfully`);
    return user;
  }

  async verify(verificationLink: string): Promise<UserNoCred> {
    return await this.userRepository.verify(verificationLink);
  }
}

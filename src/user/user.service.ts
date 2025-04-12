import {
  Injectable,
  BadRequestException,
  NotFoundException,
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

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getAll(
    paginationDto: PaginationDto,
    sortUserDto: SortUserDto,
  ): Promise<PaginatedUserNoCreds> {
    const { page, pageSize }: PaginationDto = paginationDto;
    const skip: number = pageSize * (page - 1);

    const [users, total] = await Promise.all([
      this.userRepository.findAll(skip, pageSize, sortUserDto),
      this.userRepository.count(),
    ]);

    const totalPages: number = Math.ceil(total / pageSize);

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

  async search(
    searchUserDto: SearchUserDto,
    paginationDto: PaginationDto,
    sortUserDto: SortUserDto,
  ): Promise<PaginatedUserNoCreds> {
    const { page, pageSize }: PaginationDto = paginationDto;
    const skip: number = pageSize * (page - 1);

    const [users, total] = await Promise.all([
      this.userRepository.findUsers(searchUserDto, skip, pageSize, sortUserDto),
      this.userRepository.count(searchUserDto),
    ]);

    const totalPages: number = Math.ceil(total / pageSize);

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
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getMe(userId: number): Promise<UserNoPassword> {
    return await this.userRepository.findUserProfile(userId);
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOneByEmail(email);
  }

  async create(createUserDto: CreateUserDto): Promise<UserNoPassword> {
    return await this.userRepository.create(createUserDto);
  }

  async delete(userId: number): Promise<void> {
    try {
      return await this.userRepository.delete(userId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('User not found');
      }
    }
  }

  async assignAdmin(userId: number): Promise<UserNoCred> {
    const candidate: UserNoCred = await this.userRepository.findById(userId);

    if (!candidate) {
      throw new NotFoundException('User not found');
    }

    return await this.userRepository.assignAdmin(userId);
  }
}

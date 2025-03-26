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
    sortDto: SortUserDto,
  ): Promise<PaginatedUserNoCreds> {
    const { page, pageSize }: PaginationDto = paginationDto;
    const skip: number = pageSize * (page - 1);

    const [users, total] = await Promise.all([
      this.userRepository.findAll(skip, pageSize, sortDto),
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
    dto: SearchUserDto,
    pagination: PaginationDto,
    sortDto: SortUserDto,
  ): Promise<PaginatedUserNoCreds> {
    const { page, pageSize }: PaginationDto = pagination;
    const skip: number = pageSize * (page - 1);

    const [users, total] = await Promise.all([
      this.userRepository.findUsers(dto, skip, pageSize, sortDto),
      this.userRepository.count(dto),
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

  async create(dto: CreateUserDto): Promise<UserNoPassword> {
    return await this.userRepository.create(
      dto.email,
      dto.nickname,
      dto.password,
    );
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

    try {
      return await this.userRepository.assignAdmin(userId);
    } catch (e: unknown) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('User already has admin role');
      }
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RoleService } from '../role/role.service';
import { Product, Role, User } from '@prisma/client';
import {
  UserProductsRolesNoPassword,
  UserProductsRolesNoCreds,
  UserRoles,
  UserRolesNoPassword,
  UserRolesNoProductsCreds,
} from './types/user.types';
import { PaginationDto } from '../dto/pagination.dto';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleService: RoleService,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    const { page, pageSize }: PaginationDto = paginationDto;
    const skip: number = pageSize * (page - 1);

    const users = await this.userRepository.findAll(skip, pageSize);
    const total = await this.userRepository.count();

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

  async searchUsers(dto: SearchUserDto, pagination: PaginationDto) {
    const { page, pageSize }: PaginationDto = pagination;
    const skip: number = pageSize * (page - 1);

    const users = await this.userRepository.findUsers(dto, skip, pageSize);
    const total = await this.userRepository.count();

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

  async findById(userId: number): Promise<UserProductsRolesNoCreds> {
    const user: UserProductsRolesNoCreds | null =
      await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserProfile(userId: number): Promise<UserProductsRolesNoPassword> {
    return await this.userRepository.findUserProfile(userId);
  }

  async findUserProducts(userId: number): Promise<Product[]> {
    return await this.userRepository.findUserProducts(userId);
  }

  async findByEmail(email: string): Promise<UserRoles | null> {
    return await this.userRepository.findOneByEmail(email);
  }

  async create(dto: CreateUserDto): Promise<UserRolesNoPassword> {
    const userRole: Role = await this.roleService.getRoleByValue('USER');

    return await this.userRepository.create(
      dto.email,
      dto.nickname,
      dto.password,
      userRole.id,
    );
  }

  async delete(userId: number): Promise<User> {
    try {
      return await this.userRepository.delete(userId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('User not found');
      }
    }
  }

  async assignAdmin(userId: number): Promise<UserRolesNoProductsCreds> {
    const candidate: Role[] = await this.userRepository.findUserRoles(userId);

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

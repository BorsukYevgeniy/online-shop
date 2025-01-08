import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { ProductService } from '../product/product.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RoleService } from '../roles/role.service';
import { Product, Role } from '@prisma/client';
import {
  UserProductsRolesNoPassword,
  UserProductsRolesNoCreds,
  UserRoles,
  UserRolesNoPassword,
} from './types/user.types';
import { PaginationDto } from '../dto/pagination.dto';
import { UserFilter } from './types/user-filter.type';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly productService: ProductService,
    private readonly roleService: RoleService,
  ) {}

  async findAll(paginationDto: PaginationDto, userFilter: UserFilter) {
    const { page, pageSize }: PaginationDto = paginationDto;
    const skip: number = pageSize * (page - 1);

    const users = await this.userRepository.findAll(userFilter, skip, pageSize);
    const total = await this.userRepository.count(userFilter);

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

  async findById(
    userId: number,
    requesterId: number,
  ): Promise<UserProductsRolesNoPassword | UserProductsRolesNoCreds> {
    const user: UserProductsRolesNoPassword | null =
      await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (requesterId !== userId) {
      delete user.email;
    }

    return user;
  }

  async findUserProducts(userId: number): Promise<Product[]> {
    return await this.productService.findUserProducts(userId);
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

  async delete(userId: number): Promise<UserProductsRolesNoCreds> {
    try {
      return await this.userRepository.delete(userId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('User not found');
      }
    }
  }
}

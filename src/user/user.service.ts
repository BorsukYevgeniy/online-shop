import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { ProductService } from '../product/product.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RoleService } from '../roles/role.service';
import { Product, Role } from '@prisma/client';
import {
  UserWithProductsAndRolesWithoutPassword,
  UserWithRoles,
  UserWithRolesWithoutPassword,
} from './types/user.types';
import { PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly productService: ProductService,
    private readonly roleService: RoleService,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    const { page, pageSize }: PaginationDto = paginationDto;

    const skip: number = pageSize * (page - 1);

    const users=
      await this.userRepository.findAll(skip, pageSize);

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

  async findById(
    userId: number,
  ): Promise<UserWithProductsAndRolesWithoutPassword> {
    const user: UserWithProductsAndRolesWithoutPassword | null =
      await this.userRepository.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findUserProducts(userId: number): Promise<Product[]> {
    return await this.productService.findUserProducts(userId);
  }

  async findByEmail(email: string): Promise<UserWithRoles | null> {
    return await this.userRepository.findOneByEmail(email);
  }

  async create(dto: CreateUserDto): Promise<UserWithRolesWithoutPassword> {
    const userRole: Role = await this.roleService.getRoleByValue('USER');

    return await this.userRepository.create(
      dto.email,
      dto.nickname,
      dto.password,
      userRole.id,
    );
  }

  async delete(
    userId: number,
  ): Promise<UserWithProductsAndRolesWithoutPassword> {
    try {
      return await this.userRepository.delete(userId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('User not found');
      }
    }
  }
}

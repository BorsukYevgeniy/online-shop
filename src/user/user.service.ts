import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { ProductService } from '../product/product.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RoleService } from '../roles/role.service';
import { User } from '@prisma/client';
import {
  UsersWithProductsAndRolesWithoutPassword,
  UserWithProductsAndRolesWithoutPassword,
  UserWithRoles,
} from './types/user.types';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly productService: ProductService,
    private readonly roleService: RoleService,
  ) {}

  async findAll(): Promise<UsersWithProductsAndRolesWithoutPassword> {
    return await this.userRepository.findAll();
  }

  async findById(
    userId: number,
  ): Promise<UserWithProductsAndRolesWithoutPassword> {
    const user = await this.userRepository.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findUserProducts(userId: number) {
    return await this.productService.findUserProducts(userId);
  }

  async findByEmail(email: string): Promise<UserWithRoles | null> {
    return await this.userRepository.findOneByEmail(email);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const userRole = await this.roleService.getRoleByValue('USER');

    return await this.userRepository.create(
      dto.email,
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

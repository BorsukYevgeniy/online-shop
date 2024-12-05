import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';
import { ProductService } from 'src/products/product.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly productService: ProductService,
    private readonly roleService: RolesService,
  ) {}

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findById(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findUserProducts(userId: number) {
    return await this.productService.findUserProduct(userId);
  }

  async findByEmail(email: string) {
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

  async delete(userId: number) {
    try {
      return await this.userRepository.delete(userId);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException('User not found');
      }
    }
  }
}

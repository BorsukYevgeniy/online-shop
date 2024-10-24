import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly productService: ProductService,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findById(userId: number) {
    return await this.userRepository.findById(userId);
  }

  async findUserProducts(userId: number) {
    return await this.productService.findUserProduct(userId);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOneByEmail(email);
  }

  async create(dto: CreateUserDto): Promise<User> {
    return await this.userRepository.create(dto.email, dto.password);
  }
}

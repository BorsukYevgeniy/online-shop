import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository){}
  

  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findOneUserByEmail(email: string) {
    return await this.userRepository.findOneByEmail(email);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.create(createUserDto);
  }
}

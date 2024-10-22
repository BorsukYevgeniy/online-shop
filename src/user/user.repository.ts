import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    const user: User = await this.prismaService.user.findUnique({
      where: { email },
    });
    return user;
  }

  async findAll(): Promise<User[]> {
    const users: User[] = await this.prismaService.user.findMany({});
    return users;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = await this.prismaService.user.create({ data: dto });
    return user;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findAll(): Promise<User[]> {
    const users: User[] = await this.prismaService.user.findMany({});
    return users;
  }

  async findById(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const user: User = await this.prismaService.user.findUnique({
      where: { email },
    });
    return user;
  }

  async create(email:string , password: string): Promise<User> {
    const user = await this.prismaService.user.create({
      data: {email, password},
      
    });
    return user;
  }
}

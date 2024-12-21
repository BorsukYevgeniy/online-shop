import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findAll() {
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        products: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                value: true,
                description: true,
              },
            },
          },
        },
      },
    });
    return users;
  }

  async findById(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        products: true,

        roles: {
          select: {
            role: {
              select: {
                id: true,
                value: true,
                description: true,
              },
            },
          },
        },
      },
    });
    return user;
  }
  async findOneByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        roles: {
          select: {
            role: { select: { id: true, value: true, description: true } },
          },
        },
      },
    });
    
    return user;
  }

  async create(email: string, password: string, roleId: number): Promise<User> {
    const user = await this.prismaService.user.create({
      data: {
        email,
        password,
        roles: {
          create: [{ role: { connect: { id: roleId } } }],
        },
      },
    });
    return user;
  }

  async delete(userId: number) {
    const user = await this.prismaService.user.delete({
      where: { id: userId },
      include: {
        products: true,
        roles: {
          select: {
            role: { select: { id: true, value: true, description: true } },
          },
        },
      },
    });

    return user;
  }
}

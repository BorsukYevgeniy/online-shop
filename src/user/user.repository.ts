import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  User,
  UsersWithProductsAndRolesWithoutPassword,
  UserWithRoles,
  UserWithProductsAndRolesWithoutPassword,
} from './types/user.types';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<UsersWithProductsAndRolesWithoutPassword> {
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

    return users.map((user) => ({
      ...user,
      roles: user.roles.map((r) => r.role),
    }));
  }

  async findById(
    userId: number,
  ): Promise<UserWithProductsAndRolesWithoutPassword | null> {
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

    if (!user) return null;

    return {
      ...user,
      roles: user.roles.map((r) => r.role),
    };
  }
  async findOneByEmail(email: string): Promise<UserWithRoles | null> {
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

    if (!user) return null;

    return {
      ...user,
      roles: user.roles.map((r) => r.role),
    };
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

  async delete(
    userId: number,
  ): Promise<UserWithProductsAndRolesWithoutPassword> {
    const user = await this.prismaService.user.delete({
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

    if (!user) return null;

    return {
      ...user,
      roles: user.roles.map((r) => r.role),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import {
  UserWithRoles,
  UserWithProductsAndRolesWithoutPassword,
  UserWithRolesWithoutPassword,
} from './types/user.types';
import { UserFilter } from './types/user-filter.type';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: UserFilter): Promise<number> {
    const { nickname, minDate, maxDate }: UserFilter = filter;

    return await this.prismaService.user.count({
      where: {
        nickname: { contains: nickname, mode: 'insensitive' },
        createdAt: { gte: minDate, lte: maxDate },
      },
    });
  }

  async findAll(filter: UserFilter, skip: number, limit: number) {
    const { nickname, minDate, maxDate }: UserFilter = filter;
    const users = await this.prismaService.user.findMany({
      where: {
        nickname: { contains: nickname, mode: 'insensitive' },
        createdAt: { gte: minDate, lte: maxDate },
      },

      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,

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
      skip,
      take: limit,
    });

    return users.map((user) => ({
      ...user,
      roles: user.roles.map((r: { role: Role }): Role => r.role),
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
        nickname: true,
        products: true,
        createdAt: true,

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
      roles: user.roles.map((r: { role: Role }): Role => r.role),
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
      roles: user.roles.map((r: { role: Role }): Role => r.role),
    };
  }

  async create(
    email: string,
    nickname: string,
    password: string,
    roleId: number,
  ): Promise<UserWithRolesWithoutPassword> {
    const user = await this.prismaService.user.create({
      data: {
        email,
        nickname,
        password,
        roles: {
          create: [{ role: { connect: { id: roleId } } }],
        },
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
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
      roles: user.roles.map((r: { role: Role }): Role => r.role),
    };
  }

  async delete(
    userId: number,
  ): Promise<UserWithProductsAndRolesWithoutPassword> {
    const user = await this.prismaService.user.delete({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
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
      roles: user.roles.map((r: { role: Role }): Role => r.role),
    };
  }
}

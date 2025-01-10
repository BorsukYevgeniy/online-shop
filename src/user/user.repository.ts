import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Role } from '@prisma/client';
import {
  UserRoles,
  UserProductsRolesNoPassword,
  UserRolesNoPassword,
  UserProductsRolesNoCreds,
  UserRolesNoProductsCreds,
} from './types/user.types';
import { UserFilter } from './types/user-filter.type';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assignAdmin(userId: number): Promise<UserRolesNoProductsCreds> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        roles: true,
      },
      data: {
        roles: {
          connect: { id: 2 },
        },
      },
    });

    return updatedUser;
  }

  async count(filter: UserFilter): Promise<number> {
    const { nickname, minDate, maxDate }: UserFilter = filter;

    return await this.prisma.user.count({
      where: {
        nickname: { contains: nickname, mode: 'insensitive' },
        createdAt: { gte: minDate, lte: maxDate },
      },
    });
  }

  async findAll(
    filter: UserFilter,
    skip: number,
    limit: number,
  ): Promise<UserRolesNoProductsCreds[]> {
    const { nickname, minDate, maxDate }: UserFilter = filter;
    const users = await this.prisma.user.findMany({
      where: {
        nickname: { contains: nickname, mode: 'insensitive' },
        createdAt: { gte: minDate, lte: maxDate },
      },

      select: {
        id: true,
        nickname: true,
        createdAt: true,

        roles: true,
      },
      skip,
      take: limit,
    });

    return users;
  }

  async findById(userId: number): Promise<UserProductsRolesNoCreds | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        products: true,
        roles: true,
      },
    });

    if (!user) return null;

    return user;
  }

  async findUserProfile(id: number): Promise<UserProductsRolesNoPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        email: true,
        products: true,
        createdAt: true,

        roles: true,
      },
    });

    if (!user) return null;

    return user;
  }

  async findOneByEmail(email: string): Promise<UserRoles | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });

    if (!user) return null;

    return user;
  }

  async findUserProducts(userId: number): Promise<Product[] | null> {
    const userWithProducts = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        products: true,
      },
    });

    return userWithProducts.products;
  }

  async findUserRoles(userId: number): Promise<Role[]> {
    const userRoles = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    if (!userRoles) return null;

    return userRoles.roles;
  }

  async create(
    email: string,
    nickname: string,
    password: string,
    roleId: number,
  ): Promise<UserRolesNoPassword> {
    const user = await this.prisma.user.create({
      data: {
        email,
        nickname,
        password,
        roles: {
          connect: [{ id: roleId }],
        },
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        roles: true,
      },
    });

    if (!user) return null;

    return user;
  }

  async delete(userId: number): Promise<UserProductsRolesNoCreds> {
    const user = await this.prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        products: true,
        roles: true,
      },
    });

    if (!user) return null;

    return user;
  }
}

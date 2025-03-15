import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Role, User } from '@prisma/client';
import {
  UserRoles,
  UserProductsRolesNoPassword,
  UserRolesNoPassword,
  UserProductsRolesNoCreds,
  UserRolesNoCreds,
} from './types/user.types';
import { UserFilter } from './types/user-filter.type';
import { SearchUserDto } from './dto/search-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assignAdmin(userId: number): Promise<UserRolesNoCreds> {
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

  async count(filter?: UserFilter): Promise<number> {
    return await this.prisma.user.count({
      where: {
        nickname: { contains: filter.nickname, mode: 'insensitive' },
        createdAt: {
          gte: filter.minDate,
          lte: filter.maxDate,
        },
      },
    });
  }

  async findAll(skip: number, limit: number): Promise<UserRolesNoCreds[]> {
    const users = await this.prisma.user.findMany({
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

  async findUsers(
    searchUserDto: SearchUserDto,
    skip: number,
    limit: number,
  ): Promise<UserRolesNoCreds[]> {
    return await this.prisma.user.findMany({
      where: {
        nickname: { contains: searchUserDto.nickname, mode: 'insensitive' },
        createdAt: { lte: searchUserDto.maxDate, gte: searchUserDto.minDate },
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
  }

  async findById(userId: number): Promise<UserRolesNoCreds | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,

        roles: true,
      },
    });

    return user;
  }

  async findUserProfile(userId: number): Promise<UserRolesNoPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        createdAt: true,
        roles: true,
      },
    });

    return user;
  }

  async findOneByEmail(email: string): Promise<UserRoles | null> {
    const user: UserRoles | null = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: true,
      },
    });

    return user;
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

    return user;
  }

  async delete(userId: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}

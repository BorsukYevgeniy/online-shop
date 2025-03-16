import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UserNoPassword,
  UserNoCred,
} from './types/user.types';
import { UserFilter } from './types/user-filter.type';
import { SearchUserDto } from './dto/search-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assignAdmin(userId: number): Promise<UserNoCred> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
      },
      data: {
        role: 'ADMIN'
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

  async findAll(skip: number, limit: number): Promise<UserNoCred[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
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
  ): Promise<UserNoCred[]> {
    return await this.prisma.user.findMany({
      where: {
        nickname: { contains: searchUserDto.nickname, mode: 'insensitive' },
        createdAt: { lte: searchUserDto.maxDate, gte: searchUserDto.minDate },
      },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
      },
      skip,
      take: limit,
    });
  }

  async findById(userId: number): Promise<UserNoCred | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,

        role: true,
      },
    });

    return user;
  }

  async findUserProfile(userId: number): Promise<UserNoPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });;
  }

  async create(
    email: string,
    nickname: string,
    password: string,
  ): Promise<UserNoPassword> {
    const user = await this.prisma.user.create({
      data: {
        email,
        nickname,
        password,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        role: true,
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

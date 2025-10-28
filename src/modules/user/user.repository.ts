import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UserNoPasswordVLink,
  UserNoCred,
  UserNoPassword,
} from './types/user.types';
import { SearchUserDto } from './dto/search-user.dto';
import { User } from '@prisma/client';
import { SortUserDto } from './dto/sort-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeletingCount } from 'src/common/types/deleting-count.type';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async verify(verificationLink: string): Promise<UserNoCred> {
    return await this.prisma.user.update({
      where: { verificationLink },
      data: { isVerified: true, verifiedAt: new Date() },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
        isVerified: true,
        verifiedAt: true,
      },
    });
  }

  async assignAdmin(userId: number): Promise<UserNoCred> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        isVerified: true,
        role: true,
        verifiedAt: true,
      },
      data: {
        role: 'ADMIN',
      },
    });

    return updatedUser;
  }

  async count(searchUserDto?: SearchUserDto): Promise<number> {
    return await this.prisma.user.count({
      where: {
        nickname: { contains: searchUserDto?.nickname, mode: 'insensitive' },
        createdAt: {
          gte: searchUserDto?.minDate,
          lte: searchUserDto?.maxDate,
        },
      },
    });
  }

  async findAll(
    skip: number,
    take: number,
    sortDto: SortUserDto,
    searchUserDto?: SearchUserDto,
  ): Promise<UserNoCred[]> {
    return await this.prisma.user.findMany({
      where: {
        nickname: { contains: searchUserDto?.nickname, mode: 'insensitive' },
        createdAt: {
          gte: searchUserDto?.minDate,
          lte: searchUserDto?.maxDate,
        },
      },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
        isVerified: true,
        verifiedAt: true,
      },
      skip,
      take,
      orderBy: {
        [sortDto.sortBy]: sortDto.order,
      },
    });
  }

  async findUsers(
    searchUserDto: SearchUserDto,
    skip: number,
    take: number,
    sortDto: SortUserDto,
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
        isVerified: true,
        verifiedAt: true,
      },
      skip,
      take,
      orderBy: { [sortDto.sortBy]: sortDto.order },
    });
  }

  async findFullUserById(userId: number): Promise<UserNoPassword> {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        isVerified: true,
        verifiedAt: true,
        role: true,

        email: true,
        verificationLink: true,
      },
    });
  }

  async findById(userId: number): Promise<UserNoCred | null> {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        isVerified: true,
        verifiedAt: true,
        role: true,
      },
    });
  }

  async findUserProfile(userId: number): Promise<UserNoPasswordVLink | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        createdAt: true,
        role: true,
        isVerified: true,
        verifiedAt: true,
      },
    });

    return user;
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isVerified: true,
        verificationLink: true,
      },
    });
  }

  async findOneByVerificationLink(
    verificationLink: string,
  ): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { verificationLink },
    });
  }

  async create(createDto: CreateUserDto): Promise<UserNoPassword> {
    const user = await this.prisma.user.create({
      data: { ...createDto, cart: { create: {} } },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        role: true,
        isVerified: true,
        verificationLink: true,
        verifiedAt: true,
      },
    });

    return user;
  }

  async delete(userId: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async deleteUnverifiedUsers(): Promise<DeletingCount> {
    return await this.prisma.user.deleteMany({
      where: { isVerified: false },
    });
  }
}

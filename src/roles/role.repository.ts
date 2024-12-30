import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createRole(value: string, description: string): Promise<Role> {
    return await this.prismaService.role.create({
      data: { value, description },
    });
  }

  async findByValue(value: string): Promise<Role> {
    return await this.prismaService.role.findUnique({ where: { value } });
  }

  async deleteRoleByValue(value: string): Promise<Role> {
    return await this.prismaService.role.delete({ where: { value } });
  }
}

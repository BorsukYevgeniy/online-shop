import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getRoleByValue(value: string): Promise<Role> {
    return await this.roleRepository.findByValue(value);
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    return await this.roleRepository.createRole(dto.value, dto.description);
  }

  async deleteRoleByValue(value: string): Promise<Role> {
    return await this.roleRepository.deleteRoleByValue(value);
  }
}

import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getRoleById(id: number) {
    return await this.roleRepository.findById(id);
  }

  async getRoleByValue(value: string): Promise<Role> {
    return await this.roleRepository.findByValue(value);
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    return await this.roleRepository.create(dto.value, dto.description);
  }

  async deleteRoleByValue(value: string): Promise<Role> {
    return await this.roleRepository.deleteRoleByValue(value);
  }
}

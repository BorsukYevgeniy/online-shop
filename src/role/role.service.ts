import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getRoleById(roleId: number) {
    return await this.roleRepository.findById(roleId);
  }

  async getRoleByValue(roleValue: string): Promise<Role> {
    return await this.roleRepository.findByValue(roleValue);
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.roleRepository.create(
      createRoleDto.value,
      createRoleDto.description,
    );
  }

  async deleteRoleByValue(roleValue: string): Promise<void> {
    return await this.roleRepository.deleteRoleByValue(roleValue);
  }
}

import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getRoleByValue(value: string) {
    return await this.roleRepository.findByValue(value);
  }

  async createRole(dto: CreateRoleDto) {
    return await this.roleRepository.createRole(dto.value, dto.description);
  }

  async deleteRoleByValue(value: string) {
    return await this.roleRepository.deleteRoleByValue(value);
  }
}

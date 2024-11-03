import { Injectable } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RolesRepository) {}

  async getRoleByValue(value: string) {
    return await this.roleRepository.findByValue(value);
  }

  async createRole(dto: CreateRoleDto) {
    return await this.roleRepository.createRole(dto.value, dto.description);
  }

  async deleteRoleByValue(value: string) {
    return await this.roleRepository.deleteRole(value);
  }
}

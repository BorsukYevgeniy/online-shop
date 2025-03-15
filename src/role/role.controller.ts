import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Roles } from '../auth/decorator/roles-auth.decorator';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Role } from '@prisma/client';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get(':id')
  async getRoleById(@Param('id') id: number): Promise<Role> {
    return await this.roleService.getRoleById(id);
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async create(@Body() dto: CreateRoleDto): Promise<Role> {
    return await this.roleService.create(dto);
  }

  @Delete(':value')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async deleteRoleByValue(@Param('value') roleValue: string): Promise<void> {
    return await this.roleService.deleteRoleByValue(roleValue);
  }
}

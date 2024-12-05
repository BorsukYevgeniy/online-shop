import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { Roles } from 'src/decorators/roles-auth.decorator';
import { RolesGuard } from 'src/guards/roles-auth.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Get(':value')
  async getRoleByValue(@Param('value') value: string) {
    return await this.roleService.getRoleByValue(value);
  }

  @Post('')
  // @Roles('ADMIN')
  // @UseGuards(RolesGuard)
  async createRole(@Body() dto: CreateRoleDto) {
    return await this.roleService.createRole(dto);
  }

  @Delete(':value')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async deleteRoleByValue(@Param('value') roleValue: string) {
    return await this.roleService.deleteRoleByValue(roleValue);
  }
}

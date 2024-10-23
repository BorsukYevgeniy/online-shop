import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':userId')
  async findUserById(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.findById(userId);
  }

  @Get(':userId/products')
  async findUserProductsById(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.findUserProducts(userId);
  }

  // @Post()
  // async create(@Body() createUserDto: CreateUserDto) {
  //   return await this.userService.create(createUserDto);
  // }
}

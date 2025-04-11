import {
  NotFoundException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { hash, compare } from 'bcryptjs';
import { Token, User } from '@prisma/client';
import { TokenService } from '../token/token.service';
import { Tokens } from '../token/interface/token.interfaces';
import { UserNoPassword } from '../user/types/user.types';
import { DeletingCount } from '../types/deleting-count.type';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from '../enum/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: CreateUserDto): Promise<UserNoPassword> {
    const candidate: User | null = await this.userService.getByEmail(dto.email);

    if (candidate) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword: string = await hash(dto.password, 3);
    const user: UserNoPassword = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    return user;
  }

  async login(dto: LoginUserDto): Promise<Tokens> {
    const candidate: User | null = await this.userService.getByEmail(dto.email);

    if (!candidate) {
      throw new NotFoundException('User not found');
    }

    const { password: hashedPassword, role } = candidate;

    const isPasswordValid: boolean = await compare(
      dto.password,
      hashedPassword,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Email or password are incorrect');
    }

    return await this.tokenService.generateTokens(candidate.id, role as Role);
  }

  async logout(token: string): Promise<DeletingCount> {
    return await this.tokenService.deleteUserToken(token);
  }

  async logoutAll(userId: number): Promise<DeletingCount> {
    return await this.tokenService.deleteAllUsersTokens(userId);
  }

  async refreshToken(refreshToken: string): Promise<Tokens> {
    const { id, role } =
      await this.tokenService.verifyRefreshToken(refreshToken);

    const userTokens: Token[] | null =
      await this.tokenService.getUserTokens(id);

    const validToken: boolean = userTokens.some(
      (token) => token.token === refreshToken,
    );

    if (!validToken) throw new Error('Invalid refresh token');

    return this.tokenService.generateTokens(id, role);
  }
}

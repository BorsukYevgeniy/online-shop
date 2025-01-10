import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { hash, compare } from 'bcryptjs';
import { Role, Token } from '@prisma/client';
import { TokenService } from '../token/token.service';
import { Tokens } from '../token/interface/token.interfaces';
import { UserRoles, UserRolesNoPassword } from '../user/types/user.types';
import { DeletingCount } from '../interfaces/deleting-count.interface';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: CreateUserDto): Promise<UserRolesNoPassword> {
    const candidate: UserRoles | null = await this.userService.findByEmail(
      dto.email,
    );

    if (candidate) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword: string = await hash(dto.password, 3);
    const user: UserRolesNoPassword = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    return user;
  }

  async login(dto: LoginUserDto): Promise<Tokens> {
    const candidate: UserRoles | null = await this.userService.findByEmail(
      dto.email,
    );

    if (!candidate) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { email, password: hashedPassword, roles } = candidate;

    if (dto.email !== email) {
      throw new HttpException(
        'Email or password are incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }
    const isPasswordValid: boolean = await compare(
      dto.password,
      hashedPassword,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'Email or password are incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.tokenService.generateTokens(
      candidate.id,
      roles.map((r: Role): string => r.value),
    );
  }

  async logout(token: string): Promise<DeletingCount> {
    return await this.tokenService.deleteUserTokens(token);
  }

  async logoutAll(userId: number): Promise<DeletingCount> {
    return await this.tokenService.deleteAllUsersTokens(userId);
  }

  async refreshToken(refreshToken: string): Promise<Tokens> {
    const { id, roles } =
      await this.tokenService.verifyRefreshToken(refreshToken);

    const userTokens: Token[] | null =
      await this.tokenService.getUserTokens(id);

    const validToken: boolean = userTokens.some(
      (token) => token.token === refreshToken,
    );

    if (!validToken) throw new Error('Invalid refresh token');

    return this.tokenService.generateTokens(id, roles);
  }
}

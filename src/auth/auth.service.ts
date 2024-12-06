import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { hash, compare } from 'bcryptjs';
import { Token, User } from '@prisma/client';
import { TokensService } from 'src/token/tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly tokenService: TokensService,
  ) {}

  async register(dto: CreateUserDto) {
    const candidate: User | null = await this.userService.findByEmail(
      dto.email,
    );

    if (candidate) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword: string = await hash(dto.password, 3);
    const user: User = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    return user;
  }

  async login(dto: CreateUserDto) {
    const candidate = await this.userService.findByEmail(dto.email);

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
      roles.map((ur) => ur.role.value),
    );
  }

  async logout(token: string) {
    return await this.tokenService.deleteUserTokens(token);
  }

  async refreshToken(refreshToken: string) {
    const { id, roles } =
      await this.tokenService.verifyRefreshToken(refreshToken);

    const userTokens: Token[] | null =
      await this.tokenService.getUserTokens(id);

    const validToken = userTokens.some((token) => token.token === refreshToken);
    if (!validToken) throw new Error('Invalid refresh token');

    return this.tokenService.generateTokens(id, roles);
  }
}

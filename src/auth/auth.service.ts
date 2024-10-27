import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { hash, compare } from 'bcryptjs';
import { Token, User } from '@prisma/client';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
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
    const candidate: User | null = await this.userService.findByEmail(
      dto.email,
    );

    if (!candidate) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { email, password: hashedPassword } = candidate;

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

    return await this.tokenService.generateTokens(candidate.id);
  }

  async refreshToken(refreshToken: string) {
    const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);

    const userTokens: Token[] | null =
      await this.tokenService.getUserTokens(userId);

    const validToken = userTokens.some((token) => token.token === refreshToken);
    if (!validToken) throw new Error('Invalid refresh token');

    return this.tokenService.generateTokens(userId);
  }
}

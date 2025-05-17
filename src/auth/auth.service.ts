import {
  NotFoundException,
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { hash, compare } from 'bcryptjs';
import { Token, User } from '@prisma/client';
import { TokenService } from '../token/token.service';
import { Tokens } from '../token/interface/token.interfaces';
import { UserNoCred, UserNoPassword } from '../user/types/user.types';
import { DeletingCount } from '../types/deleting-count.type';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from '../enum/role.enum';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);
  private readonly API_URL: string;

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.API_URL = this.configService.get<string>('API_URL');
  }

  async register(dto: CreateUserDto): Promise<UserNoPassword> {
    const candidate: User | null = await this.userService.getByEmail(dto.email);

    if (candidate) {
      this.logger.warn(`User already exists: ${dto.email}`);
      throw new BadRequestException('User already exists');
    }

    const hashedPassword: string = await hash(dto.password, 3);
    const user: UserNoPassword = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    await this.mailService.sendVerificationMail(
      user.email,
      this.API_URL + `/auth/verify/${user.verificationLink}`,
    );

    this.logger.log(`New user registered: ${user.email}`);
    return user;
  }

  async login(dto: LoginUserDto): Promise<Tokens> {
    const candidate: User | null = await this.userService.getByEmail(dto.email);

    if (!candidate) {
      this.logger.warn(`User not found: ${dto.email}`);
      throw new NotFoundException('User not found');
    }

    const { password: hashedPassword, role } = candidate;

    const isPasswordValid: boolean = await compare(
      dto.password,
      hashedPassword,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${dto.email}`);
      throw new BadRequestException('Email or password are incorrect');
    }

    this.logger.log(`User logged in: ${dto.email}`);
    return await this.tokenService.generateTokens({
      id: candidate.id,
      role: candidate.role as Role,
      isVerified: candidate.isVerified,
    });
  }

  async logout(token: string): Promise<DeletingCount> {
    return await this.tokenService.deleteUserToken(token);
  }

  async logoutAll(userId: number): Promise<DeletingCount> {
    return await this.tokenService.deleteAllUsersTokens(userId);
  }

  async refreshToken(refreshToken: string): Promise<Tokens> {
    const { id, isVerified, role } =
      await this.tokenService.verifyRefreshToken(refreshToken);

    const userTokens: Token[] | null =
      await this.tokenService.getUserTokens(id);

    const validToken: boolean = userTokens.some(
      (token) => token.token === refreshToken,
    );

    if (!validToken) {
      this.logger.warn(`Invalid refresh token for user ID: ${id}`);
      throw new BadRequestException('Invalid refresh token');
    }

    const tokens = await this.tokenService.generateTokens({
      id,
      role,
      isVerified,
    });

    this.logger.log(`Refresh token successful for user ID: ${id}`);
    return tokens;
  }

  async verifyUser(verificationLink: string): Promise<UserNoCred> {
    const user: User | null =
      await this.userService.getByVerificationLink(verificationLink);

    if (!user) {
      this.logger.warn(
        `User not found with verification link: ${verificationLink}`,
      );
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      this.logger.warn(`User already verified: ${user.email}`);
      throw new BadRequestException('User already verified');
    }

    return await this.userService.verify(verificationLink);
  }
}

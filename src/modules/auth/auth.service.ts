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
import { DeletingCount } from '../../common/types/deleting-count.type';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from '../../common/enum/role.enum';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '../config/config.service';

import { UserErrorMessages as UserErrMsg } from '../user/constants/user-error-messages.constants';
import { TokenErrorMessages as TokenErrMsg } from '../token/enum/token-error-messages.enum';
import { AuthErrorMessages as AuthErrMsg } from './enum/auth-error-messages.enum';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {    
  }

  async register(
    dto: CreateUserDto,
    mode: 'api' | 'ssr' = 'api',
  ): Promise<Tokens> {
    const candidate = await this.userService.getByEmail(dto.email);

    if (candidate) {
      this.logger.warn(`User already exists: ${dto.email}`);
      throw new BadRequestException(AuthErrMsg.InvalidCredentials);
    }

    const hashedPassword: string = await hash(dto.password, 3);
    const user: UserNoPassword = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    await this.sendVerificationMail(user.email, user.verificationLink, mode);

    this.logger.log(`New user registered: ${user.email}`);

    return await this.tokenService.generateTokens({
      id: user.id,
      isVerified: user.isVerified,
      role: user.role as Role,
    });
  }

  async login(dto: LoginUserDto): Promise<Tokens> {
    const candidate = await this.userService.getByEmail(dto.email);

    if (!candidate) {
      this.logger.warn(`User not found: ${dto.email}`);
      throw new NotFoundException(AuthErrMsg.InvalidCredentials);
    }

    const { password: hashedPassword } = candidate;

    const isPasswordValid: boolean = await compare(
      dto.password,
      hashedPassword,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${dto.email}`);
      throw new BadRequestException(AuthErrMsg.InvalidCredentials);
    }

    this.logger.log(`User logged in: ${dto.email}`);
    return await this.tokenService.generateTokens({
      id: candidate.id,
      role: candidate.role as Role,
      isVerified: candidate.isVerified,
    });
  }

  async logout(token: string): Promise<Token> {
    if (!token)
      throw new BadRequestException(TokenErrMsg.RefreshTokenIsMissing);

    return await this.tokenService.deleteUserToken(token);
  }

  async logoutAll(userId: number): Promise<DeletingCount> {
    return await this.tokenService.deleteAllUsersTokens(userId);
  }

  async refreshToken(refreshToken: string): Promise<Tokens> {
    const { id } = await this.tokenService.verifyRefreshToken(refreshToken);

    const userTokens: Token[] | null =
      await this.tokenService.getUserTokens(id);

    const validToken: boolean = userTokens.some(
      (token) => token.token === refreshToken,
    );

    if (!validToken) {
      this.logger.warn(`Invalid refresh token for user ID: ${id}`);
      throw new BadRequestException(TokenErrMsg.InvalidRefreshToken);
    }

    const tokens = await this.tokenService.updateTokens(refreshToken);

    this.logger.log(`Token refreshed successful for user ID: ${id}`);
    return tokens;
  }

  async verifyUser(verificationLink: string): Promise<UserNoCred> {
    const user: User | null =
      await this.userService.getByVerificationLink(verificationLink);

    if (!user) {
      this.logger.warn(
        `User not found with verification link: ${verificationLink}`,
      );
      throw new NotFoundException(UserErrMsg.UserNotFound);
    }

    if (user.isVerified) {
      this.logger.warn(`User already verified: ${user.email}`);
      throw new BadRequestException(AuthErrMsg.UserAlreadyVerified);
    }

    return await this.userService.verify(verificationLink);
  }

  async resendVerificationMail(
    userId: number,
    mode: 'api' | 'ssr' = 'api',
  ): Promise<void> {
    const { email, verificationLink, isVerified }: UserNoPassword =
      await this.userService.getFullUserById(userId);

    if (isVerified)
      throw new BadRequestException(AuthErrMsg.UserAlreadyVerified);

    return await this.sendVerificationMail(email, verificationLink, mode);
  }

  private async sendVerificationMail(
    email: string,
    verificationLink: string,
    mode: 'api' | 'ssr' = 'api',
  ): Promise<void> {
    return await this.mailService.sendVerificationMail(
      email,
      this.configService.APP_URL +
        (mode === 'api' ? '/api' : '') +
        `/auth/verify/${verificationLink}`,
    );
  }
}

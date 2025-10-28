import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '../../common/enum/role.enum';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '../config/config.service';
import { Token, User } from '@prisma/client';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const { hash, compare } = jest.requireMock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            getByEmail: jest.fn(),
            create: jest.fn(),
            verify: jest.fn(),
            getByVerificationLink: jest.fn(),
            getFullUserById: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: MailService, useValue: { sendVerificationMail: jest.fn() } },
        {
          provide: TokenService,
          useValue: {
            generateTokens: jest.fn(),
            deleteUserToken: jest.fn(),
            deleteAllUsersTokens: jest.fn(),
            verifyRefreshToken: jest.fn(),
            getUserTokens: jest.fn(),
            updateTokens: jest.fn(),
          },
        },
        { provide: ConfigService, useValue: { APP_URL: '123'}}
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    tokenService = module.get<TokenService>(TokenService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('Should register user', () => {
    const dto: CreateUserDto = {
      email: 'test@gmail.com',
      nickname: 'test',
      password: '12345',
    };
    const hashedPassword = 'hashedPassword';
    const mockUser = {
      id: 1,
      ...dto,
      password: hashedPassword,
      createdAt: new Date(),
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };
    const mockTokens = {
      accessToken: '123',
      refreshToken: '123',
    };

    it.each<[string, boolean]>([
      ['Should register user', true],
      ['Should throw an error if user already exists', false],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        jest.spyOn(userService, 'getByEmail').mockResolvedValue(null);
        hash.mockResolvedValue(hashedPassword);
        jest.spyOn(userService, 'create').mockResolvedValue(mockUser);
        jest
          .spyOn(tokenService, 'generateTokens')
          .mockResolvedValue(mockTokens);

        const tokens = await service.register(dto);

        expect(tokens).toEqual(mockTokens);

        expect(tokenService.generateTokens).toHaveBeenCalledWith({
          id: mockUser.id,
          role: mockUser.role as Role,
          isVerified: mockUser.isVerified,
        });
        expect(userService.getByEmail).toHaveBeenCalledWith(dto.email);
        expect(userService.create).toHaveBeenCalledWith({
          ...dto,
          password: hashedPassword,
        });
      } else {
        jest.spyOn(userService, 'getByEmail').mockResolvedValue(mockUser);
        hash.mockResolvedValue(hashedPassword);
        jest.spyOn(userService, 'create').mockResolvedValue(mockUser);

        await expect(service.register(dto)).rejects.toThrow(
          BadRequestException,
        );
      }
    });
  });

  describe('Should login user', () => {
    const dto: CreateUserDto = {
      email: 'test@gmail.com',
      nickname: 'test',
      password: '12345',
    };
    const hashedPassword = 'hashedPassword';
    const mockUser = {
      ...dto,
      id: 1,
      password: hashedPassword,
      createdAt: new Date(),
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };
    const mockTokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    it.each<[string, boolean, boolean]>([
      ['Should login a user', true, false],
      ['Should throw NotFoundException if user not found', false, false],
      [
        'Should throw BadRequestException if email or password are incorrect',
        false,
        true,
      ],
    ])('%s', async (_, isSuccess, isUserFounded) => {
      if (isSuccess) {
        jest.spyOn(userService, 'getByEmail').mockResolvedValue(mockUser);
        compare.mockResolvedValue(true);
        jest
          .spyOn(tokenService, 'generateTokens')
          .mockResolvedValue(mockTokens);

        const tokens = await service.login(dto);

        expect(tokens).toEqual(mockTokens);
        expect(userService.getByEmail).toHaveBeenCalledWith(dto.email);
        expect(compare).toHaveBeenCalledWith(dto.password, hashedPassword);
        expect(tokenService.generateTokens).toHaveBeenCalledWith({
          id: mockUser.id,
          role: mockUser.role,
          isVerified: mockUser.isVerified,
        });
      } else if (!isUserFounded) {
        jest.spyOn(userService, 'getByEmail').mockResolvedValue(null);

        await expect(service.login(dto)).rejects.toThrow(NotFoundException);
      } else {
        jest.spyOn(userService, 'getByEmail').mockResolvedValue(mockUser);
        compare.mockResolvedValue(false);

        await expect(service.login(dto)).rejects.toThrow(BadRequestException);
      }
    });
  });

  it('Should logout a user', async () => {
    const refreshToken = 'refreshToken';

    jest.spyOn(tokenService, 'deleteUserToken').mockResolvedValue({} as Token);

    await service.logout(refreshToken);

    expect(tokenService.deleteUserToken).toHaveBeenCalledWith(refreshToken);
  });

  it('Should logout all users', async () => {
    const userId = 1;

    jest.spyOn(tokenService, 'deleteUserToken').mockResolvedValue({} as Token);

    await service.logoutAll(userId);

    expect(tokenService.deleteAllUsersTokens).toHaveBeenCalledWith(userId);
  });

  it('Should refresh tokens', async () => {
    const refreshToken = 'refreshToken';

    const mockTokens = {
      accessToken: 'accessToken',
      refreshToken: 'newRefreshToken',
    };

    jest
      .spyOn(tokenService, 'verifyRefreshToken')
      .mockResolvedValue({ id: 1, role: Role.USER, isVerified: false });

    jest
      .spyOn(tokenService, 'getUserTokens')
      .mockResolvedValue([
        { id: 1, token: refreshToken, userId: 1, expiresAt: new Date() },
      ]);

    jest.spyOn(tokenService, 'updateTokens').mockResolvedValue(mockTokens);

    const tokens = await service.refreshToken(refreshToken);

    expect(tokens).toEqual(mockTokens);
  });

  describe('Should verify user', () => {
    const date = new Date();

    const mockUser = {
      id: 1,
      createdAt: date,
      email: 'email',
      isVerified: false,
      nickname: 'nick',
      password: '123',
      role: Role.USER,
      verificationLink: '123',
      verifiedAt: null,
    };
    it.each<[string, string, boolean, boolean]>([
      ['Should verify user', '123', false, true],
      ['Should throw NotFoundException', '123', false, false],
      ['Should throw BadRequestException', '123', true, false],
    ])('%s', async (_, link, isVerified, isUserFounded) => {
      if (!isVerified && isUserFounded) {
        jest
          .spyOn(userService, 'getByVerificationLink')
          .mockResolvedValue(mockUser);

        jest.spyOn(userService, 'verify').mockResolvedValue({
          ...mockUser,
          isVerified: true,
          verifiedAt: date,
        });

        const user = await service.verifyUser(link);

        expect(user).toEqual({
          ...mockUser,
          isVerified: true,
          verifiedAt: date,
        });
      } else if (!isVerified && !isUserFounded) {
        jest
          .spyOn(userService, 'getByVerificationLink')
          .mockResolvedValue(null);

        await expect(service.verifyUser(link)).rejects.toThrow(
          NotFoundException,
        );
      } else {
        jest.spyOn(userService, 'getByVerificationLink').mockResolvedValue({
          ...mockUser,
          isVerified: true,
          verifiedAt: date,
        });

        await expect(service.verifyUser(link)).rejects.toThrow(
          BadRequestException,
        );
      }
    });
  });

  it('Should resend email', async () => {
    const userId = 1;
    jest
      .spyOn(userService, 'getFullUserById')
      .mockResolvedValue({ email: '123', verificationLink: '123' } as User);

    await expect(service.resendVerificationMail(userId)).resolves.toEqual(
      undefined,
    );
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { TokenService } from '../token/token.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Role } from '@prisma/client';

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
          useValue: { findByEmail: jest.fn(), create: jest.fn() },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokens: jest.fn(),
            deleteUserTokens: jest.fn(),
            deleteAllUsersTokens: jest.fn(),
            verifyRefreshToken: jest.fn(),
            getUserTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    tokenService = module.get<TokenService>(TokenService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should register a user', async () => {
    const dto: CreateUserDto = {
      email: 'test@gmail.com',
      nickname: 'test',
      password: '12345',
    };
    const hashedPassword = 'hashedPassword';
    const mockUser = {
      id: 1,
      email: dto.email,
      nickname: 'test',
      createdAt: new Date(),
      roles: [{} as Role],
    };

    jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
    hash.mockResolvedValue(hashedPassword);
    jest.spyOn(userService, 'create').mockResolvedValue(mockUser);

    const user = await service.register(dto);

    expect(user).toEqual(mockUser);
  });

  it('should throw an error if user already exists', async () => {
    const dto: CreateUserDto = {
      email: 'test@gmail.com',
      nickname: 'test',
      password: '12345',
    };
    const hashedPassword = 'hashedPassword';
    const mockUser = {
      ...dto,
      id: 1,
      nickname: 'test',
      createdAt: new Date(),

      password: hashedPassword,
      roles: [{ id: 1, value: 'ADMIN', description: 'S' }],
    };

    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
    hash.mockResolvedValue(hashedPassword);
    jest.spyOn(userService, 'create').mockResolvedValue(mockUser);

    await expect(service.register(dto)).rejects.toThrow(
      new HttpException('User already exists', HttpStatus.BAD_REQUEST),
    );
  });

  it('should login a user', async () => {
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
      nickname: 'test',
      createdAt: new Date(),

      roles: [{ id: 1, value: 'ADMIN', description: 'S' }],
    };
    const mockTokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
    compare.mockResolvedValue(true);

    jest.spyOn(tokenService, 'generateTokens').mockResolvedValue(mockTokens);

    const tokens = await service.login(dto);

    expect(tokens).toEqual(mockTokens);
  });

  it('should throw an error if user not found', async () => {
    const dto: CreateUserDto = {
      email: 'test@gmail.com',
      nickname: 'test',
      password: '12345',
    };
    jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

    await expect(service.login(dto)).rejects.toThrow(
      new HttpException('User not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should throw an error if email or password are incorrect', async () => {
    const dto: CreateUserDto = {
      email: 'test@gmail.com',
      nickname: 'test',
      password: 'wrongPassword',
    };
    const mockUser = {
      id: 1,
      email: 'test@gmail.com',
      nickname: 'test',
      createdAt: new Date(),

      password: 'hashedPassword',
      roles: [{ id: 1, value: 'ADMIN', description: 'S' }],
    };

    jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser);
    compare.mockResolvedValue(false);

    await expect(service.login(dto)).rejects.toThrow(
      new HttpException(
        'Email or password are incorrect',
        HttpStatus.BAD_REQUEST,
      ),
    );
  });

  it('should logout a user', async () => {
    const refreshToken = 'refreshToken';

    jest
      .spyOn(tokenService, 'deleteUserTokens')
      .mockResolvedValue({ count: 1 });

    await service.logout(refreshToken);

    expect(tokenService.deleteUserTokens).toHaveBeenCalledWith(refreshToken);
  });

  it('should logout all users', async () => {
    const userId = 1;

    jest
      .spyOn(tokenService, 'deleteUserTokens')
      .mockResolvedValue({ count: 1 });

    await service.logoutAll(userId);

    expect(tokenService.deleteAllUsersTokens).toHaveBeenCalledWith(userId);
  });

  it('should refresh tokens', async () => {
    const refreshToken = 'refreshToken';

    const mockTokens = {
      accessToken: 'accessToken',
      refreshToken: 'newRefreshToken',
    };

    jest
      .spyOn(tokenService, 'verifyRefreshToken')
      .mockResolvedValue({ id: 1, roles: ['ADMIN'] });

    jest
      .spyOn(tokenService, 'getUserTokens')
      .mockResolvedValue([
        { id: 1, token: refreshToken, userId: 1, expiresAt: new Date() },
      ]);

    jest.spyOn(tokenService, 'generateTokens').mockResolvedValue(mockTokens);

    const tokens = await service.refreshToken(refreshToken);

    expect(tokens).toEqual(mockTokens);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../enum/role.enum';

describe('TokenService', () => {
  let service: TokenService;
  let repository: TokenRepository;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: TokenRepository,
          useValue: {
            findUserTokens: jest.fn(),
            create: jest.fn(),
            deleteUserToken: jest.fn(),
            deleteAllUsersTokens: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    repository = module.get<TokenRepository>(TokenRepository);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('Should generate and save tokens', async () => {
    const userId = 1;
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    jest.spyOn(jwt, 'signAsync').mockResolvedValueOnce(accessToken);
    jest.spyOn(jwt, 'signAsync').mockResolvedValueOnce(refreshToken);
    jest.spyOn(repository, 'create').mockResolvedValue({
      id: 1,
      token: refreshToken,
      userId: 1,
      expiresAt: new Date(),
    });

    const result = await service.generateTokens({
      id: userId,
      role: Role.ADMIN,
      isVerified: false,
    });

    expect(repository.create).toHaveBeenCalledWith(
      userId,
      refreshToken,
      expect.any(Date),
    );
    expect(result).toEqual({ accessToken, refreshToken });
  });

  it('Should verify refresh token', async () => {
    const refreshToken = 'refresh-token';
    const payload = { id: 1, roles: ['user'] };

    jest.spyOn(jwt, 'verifyAsync').mockResolvedValue(payload);

    const result = await service.verifyRefreshToken(refreshToken);

    expect(jwt.verifyAsync).toHaveBeenCalledWith(refreshToken, {
      secret: undefined,
    });
    expect(result).toEqual(payload);
  });

  it('Should verify access token', async () => {
    const accessToken = 'access-token';
    const payload = { id: 1, roles: ['user'] };

    jest.spyOn(jwt, 'verifyAsync').mockResolvedValue(payload);

    const result = await service.verifyAccessToken(accessToken);

    expect(jwt.verifyAsync).toHaveBeenCalledWith(accessToken, {
      secret: undefined,
    });
    expect(result).toEqual(payload);
  });

  it('Should return user tokens', async () => {
    const userId = 1;
    const tokens = [
      { id: 1, token: 'token', userId: 1, expiresAt: new Date() },
    ];

    jest.spyOn(repository, 'findUserTokens').mockResolvedValue(tokens);

    const result = await service.getUserTokens(userId);

    expect(repository.findUserTokens).toHaveBeenCalledWith(userId);
    expect(result).toEqual(tokens);
  });

  it('Should delete all user tokens', async () => {
    const userId = 1;

    jest.spyOn(repository, 'deleteUserToken').mockResolvedValue({ count: 1 });

    await service.deleteAllUsersTokens(userId);

    expect(repository.deleteAllUsersTokens).toHaveBeenCalledWith(userId);
  });

  it('Should delete user tokens', async () => {
    const token = 'token';

    jest.spyOn(repository, 'deleteUserToken').mockResolvedValue({ count: 1 });

    await service.deleteUserToken(token);

    expect(repository.deleteUserToken).toHaveBeenCalledWith(token);
  });
});

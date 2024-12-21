import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { TokensRepository } from './tokens.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const mockTokensRepository = {
  create: jest.fn(),
  findUserTokens: jest.fn(),
  deleteUserTokens: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('TokensService', () => {
  let service: TokensService;
  let repository: typeof mockTokensRepository;
  let jwt: typeof mockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: TokensRepository, useValue: mockTokensRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
    repository = module.get(TokensRepository);
    jwt = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTokens', () => {
    it('should generate and save tokens', async () => {
      const userId = 1;
      const roles = ['admin'];
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      jwt.signAsync.mockResolvedValueOnce(accessToken);
      jwt.signAsync.mockResolvedValueOnce(refreshToken);
      repository.create.mockResolvedValueOnce(null);

      const result = await service.generateTokens(userId, roles);

      expect(jwt.signAsync).toHaveBeenCalledWith(
        { id: userId, roles },
        { expiresIn: '1h', secret: undefined },
      );
      expect(jwt.signAsync).toHaveBeenCalledWith(
        { id: userId, roles },
        { expiresIn: '1d', secret: undefined },
      );
      expect(repository.create).toHaveBeenCalledWith(
        userId,
        refreshToken,
        expect.any(Date),
      );
      expect(result).toEqual({ accessToken, refreshToken });
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify refresh token', async () => {
      const refreshToken = 'refresh-token';
      const payload = { id: 1, roles: ['user'] };

      jwt.verifyAsync.mockResolvedValueOnce(payload);

      const result = await service.verifyRefreshToken(refreshToken);

      expect(jwt.verifyAsync).toHaveBeenCalledWith(refreshToken, {
        secret: undefined,
      });
      expect(result).toEqual(payload);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify access token', async () => {
      const accessToken = 'access-token';
      const payload = { id: 1, roles: ['user'] };

      jwt.verifyAsync.mockResolvedValueOnce(payload);

      const result = await service.verifyAccessToken(accessToken);

      expect(jwt.verifyAsync).toHaveBeenCalledWith(accessToken, {
        secret: undefined,
      });
      expect(result).toEqual(payload);
    });
  });

  describe('getUserTokens', () => {
    it('should return user tokens', async () => {
      const userId = 1;
      const tokens = [{ id: 1, token: 'token' }];

      repository.findUserTokens.mockResolvedValueOnce(tokens);

      const result = await service.getUserTokens(userId);

      expect(repository.findUserTokens).toHaveBeenCalledWith(userId);
      expect(result).toEqual(tokens);
    });
  });

  describe('deleteUserTokens', () => {
    it('should delete user tokens', async () => {
      const token = 'token';

      repository.deleteUserTokens.mockResolvedValueOnce(null);

      await service.deleteUserTokens(token);

      expect(repository.deleteUserTokens).toHaveBeenCalledWith(token);
    });
  });
});

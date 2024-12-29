import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Response } from 'express';
import { AuthRequest } from 'src/interface/express-requests.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('should register a user', async () => {
    const dto: CreateUserDto = { email: 'test@gmail.com', password: '12345' };

    const mockUser = { ...dto, id: 1, password: 'hashedPassword' };

    jest.spyOn(service, 'register').mockResolvedValue(mockUser);

    const user = await controller.registraion(dto);

    expect(user).toEqual(mockUser);
  });

  it('should login a user', async () => {
    const dto: CreateUserDto = { email: 'test@gmail.com', password: '12345' };
    const mockTokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };
    const res: Partial<Response> = {
      cookie: jest.fn(),
      send: jest.fn(),
    };

    jest.spyOn(service, 'login').mockResolvedValue(mockTokens);

    await controller.login(dto, res as Response);

    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      mockTokens.accessToken,
      {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      },
    );

    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      mockTokens.refreshToken,
      {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    );
  });

  it('should logout a user', async () => {
    const req: AuthRequest = {
      user: {
        id: 1,
        roles: ['USER'],
      },
      cookies: { refreshToken: 'refreshToken' },
    } as any;
    const res: Partial<Response> = {
      clearCookie: jest.fn(),
      send: jest.fn(),
    } as any;

    jest.spyOn(service, 'logout').mockResolvedValue({ count: 1 });

    await controller.logout(req, res as Response);

    expect(service.logout).toHaveBeenCalledWith(req.cookies.refreshToken);
    expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(res.send).toHaveBeenCalledWith({ message: 'Logouted succesfully' });
  });

  it('should refresh tokens', async () => {
    const req: AuthRequest = {
      user: { id: 1, roles: ['USER'] },
      cookies: { refreshToken: 'refreshToken' },
    } as any;

    const res: Partial<Response> = { cookie: jest.fn(), send: jest.fn() };

    const mockTokens = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    jest.spyOn(service, 'refreshToken').mockResolvedValue(mockTokens);

    await controller.refresh(req, res as any);

    expect(service.refreshToken).toHaveBeenCalledWith(req.cookies.refreshToken);
    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      mockTokens.accessToken,
      {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      },
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      mockTokens.refreshToken,
      {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    );

    expect(res.send).toHaveBeenCalledWith({ message: 'Token refreshed' });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TokenService } from '../token/token.service';
import { AuthRequest } from '../interface/express-requests.interface';
import { Response } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findUserProducts: jest.fn(),
            delete: jest.fn(),
          },
        },

        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test',
        password: 'password',
        products: [
          {
            id: 1,
            userId: 1,
            description: 'Product description',
            title: 'Product title',
            price: 100,
            images: ['image1.jpg', 'image2.jpg'],
          },
        ],
        roles: [
          {
            role: {
              id: 1,
              value: 'admin',
              description: 'Administrator role',
            },
          },
        ],
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue(mockUsers);

    const users = await controller.findAll();

    expect(users).toEqual(mockUsers);
  });

  it('should return user by id', async () => {
    const userId = 1;
    const mockUsers = {
      id: userId,
      email: 'test',
      password: 'password',
      products: [
        {
          id: 1,
          userId: 1,
          description: 'Product description',
          title: 'Product title',
          price: 100,
          images: ['image1.jpg', 'image2.jpg'],
        },
      ],
      roles: [
        {
          role: {
            id: 1,
            value: 'admin',
            description: 'Administrator role',
          },
        },
      ],
    };

    jest.spyOn(service, 'findById').mockResolvedValue(mockUsers);

    const user = await service.findById(userId);

    expect(service.findById).toHaveBeenCalledWith(userId);
    expect(user).toEqual(mockUsers);
  });

  it('should return user products', async () => {
    const userId = 1;
    const mockProducts = [
      {
        id: 1,
        userId,
        description: 'Product description',
        title: 'Product title',
        price: 100,
        images: ['image1.jpg', 'image2.jpg'],
      },
    ];

    jest.spyOn(service, 'findUserProducts').mockResolvedValue(mockProducts);

    const products = await controller.findUserProductsById(userId);

    expect(products).toEqual(mockProducts);
  });


  it('should delete user', async () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      email: 'test',
      password: 'password',
      products: [
        {
          id: 1,
          userId: 1,
          description: 'Product description',
          title: 'Product title',
          price: 100,
          images: ['image1.jpg', 'image2.jpg'],
        },
      ],
      roles: [
        {
          role: {
            id: 1,
            value: 'admin',
            description: 'Administrator role',
          },
        },
      ],
    };

    jest.spyOn(service, 'delete').mockResolvedValue(mockUser);

    const res: Partial<Response> = {
      clearCookie: jest.fn(),
      send: jest.fn(),
    } as any;

    const req: AuthRequest = { user: { id: userId } } as any;

    const user = await controller.deleteUserById(req, res as any);

    expect(service.delete).toHaveBeenCalledWith(userId);
    expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(res.send).toHaveBeenCalledWith(mockUser);
  });
});

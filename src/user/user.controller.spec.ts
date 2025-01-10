import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TokenService } from '../token/token.service';
import { AuthRequest } from '../interfaces/express-requests.interface';
import { Response } from 'express';
import { mock } from 'node:test';

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
            assignAdmin: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findUserProducts: jest.fn(),
            findUserProfile: jest.fn(),
            delete: jest.fn(),
          },
        },

        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('should assing new admin', async () => {
    const mockUser = {
      id: 1,
      nickname: 'test',
      createdAt: new Date(),
      roles: [
        {
          id: 1,
          value: 'USER',
          description: 'user role',
        },
      ],
    };

    jest.spyOn(service, 'assignAdmin').mockResolvedValue(mockUser);

    const user = await controller.assignAdmin(1);

    expect(user).toEqual(mockUser);
  });

  it('should return all users without filters', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test',
        nickname: 'test',
        createdAt: new Date(),

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
            id: 1,
            value: 'admin',
            description: 'Administrator role',
          },
        ],
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue({
      users: mockUsers,
      page: 1,
      total: 1,
      pageSize: 10,
      totalPages: 1,
      nextPage: null,
      prevPage: null,
    });

    const users = await controller.findAll({ page: 1, pageSize: 10 }, {});

    expect(users).toEqual({
      users: mockUsers,
      page: 1,
      total: 1,
      pageSize: 10,
      totalPages: 1,
      nextPage: null,
      prevPage: null,
    });
  });

  it('should return all users filtered by nickname', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test',
        nickname: 'test',
        createdAt: new Date(),

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
            id: 1,
            value: 'admin',
            description: 'Administrator role',
          },
        ],
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 10,
      nextPage: null,
      prevPage: null,
    });

    const users = await controller.findAll(
      { page: 1, pageSize: 10 },
      { nickname: 'test' },
    );

    expect(users).toEqual({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 10,
      nextPage: null,
      prevPage: null,
    });
  });

  it('should return all users filtered by date range', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test',
        nickname: 'test',
        createdAt: new Date(),

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
            id: 1,
            value: 'admin',
            description: 'Administrator role',
          },
        ],
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 10,
      nextPage: null,
      prevPage: null,
    });

    const users = await controller.findAll(
      { page: 1, pageSize: 10 },
      { minDate: new Date(), maxDate: new Date() },
    );

    expect(users).toEqual({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 10,
      nextPage: null,
      prevPage: null,
    });
  });

  it('should return all users filtered by nickname and date range', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test',
        nickname: 'test',
        createdAt: new Date(),

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
            id: 1,
            value: 'admin',
            description: 'Administrator role',
          },
        ],
      },
    ];

    jest.spyOn(service, 'findAll').mockResolvedValue({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 10,
      nextPage: null,
      prevPage: null,
    });

    const users = await controller.findAll(
      { page: 1, pageSize: 10 },
      { nickname: 'test', minDate: new Date(), maxDate: new Date() },
    );

    expect(users).toEqual({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 10,
      nextPage: null,
      prevPage: null,
    });
  });

  it('should return user by id', async () => {
    const userId = 1;
    const req = { user: { id: 2, roles: ['USER'] } } as AuthRequest;
    const res = { send: jest.fn() } as unknown as Response;

    const mockUsers = {
      id: userId,
      email: 'test',
      nickname: 'test',
      createdAt: new Date(),

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
          id: 1,
          value: 'admin',
          description: 'Administrator role',
        },
      ],
    };

    jest.spyOn(service, 'findById').mockResolvedValue(mockUsers);

    const user = await controller.findUserById(userId, req, {
      send: jest.fn(),
    } as unknown as Response);

    expect(service.findById).toHaveBeenCalledWith(userId);
  });

  it('should return user profile', async () => {
    const req = { user: { id: 1, roles: ['USER'] } } as AuthRequest;
    const mockUser = {
      id: 1,
      nickname: 'test',
      createdAt: new Date(),
      email: 'test',

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
          id: 1,
          value: 'admin',
          description: 'Administrator role',
        },
      ],
    };

    jest.spyOn(service, 'findUserProfile').mockResolvedValue(mockUser);

    const user = await controller.findUserProfile(req);

    expect(user).toEqual(mockUser);
    expect(service.findUserProfile).toHaveBeenCalledWith(1);
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
      nickname: 'test',
      createdAt: new Date(),

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
          id: 1,
          value: 'admin',
          description: 'Administrator role',
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

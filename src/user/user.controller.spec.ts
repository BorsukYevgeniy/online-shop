import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TokenService } from '../token/token.service';
import { Response } from 'express';
import { ProductService } from '../product/product.service';
import { AuthRequest } from '../types/request.type';
import { Role } from '../enum/role.enum';
import { Order } from '../enum/order.enum';

const req = { user: { id: 2, role: Role.USER } } as AuthRequest;

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            assignAdmin: jest.fn(),
            getAll: jest.fn(),
            search: jest.fn(),
            getById: jest.fn(),
            getUserProducts: jest.fn(),
            getMe: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: ProductService, useValue: { getUserProducts: jest.fn() } },
        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    productService = module.get<ProductService>(ProductService);
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
      role: Role.USER,
    };

    jest.spyOn(userService, 'assignAdmin').mockResolvedValue(mockUser);

    const user = await controller.assignAdmin(1);

    expect(user).toEqual(mockUser);
  });

  it('should return all users without filters with default sorting', async () => {
    const mockUsers = [
      {
        id: 1,
        nickname: 'test',
        createdAt: new Date(),
        role: Role.USER,
      },
    ];

    jest.spyOn(userService, 'getAll').mockResolvedValue({
      users: mockUsers,
      page: 1,
      total: 1,
      pageSize: 10,
      totalPages: 1,
      nextPage: null,
      prevPage: null,
    });

    const users = await controller.getAll(
      { page: 1, pageSize: 10 },
      { sortBy: 'id', order: Order.DESC },
    );

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

  it('should return all users searched by nickname with default sorting', async () => {
    const mockUsers = [
      {
        id: 1,
        nickname: 'test',
        createdAt: new Date(),
        role: Role.USER,
      },
    ];

    jest.spyOn(userService, 'search').mockResolvedValue({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 10,
      nextPage: null,
      prevPage: null,
    });

    const users = await controller.search(
      { nickname: 'test' },
      { page: 1, pageSize: 10 },
      {sortBy: 'id', order: Order.DESC},
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

  it('should return all users searched by nickname and date range with default sorting', async () => {
    const mockUsers = [
      {
        id: 1,
        nickname: 'test',
        createdAt: new Date(),
        role: Role.USER,
      },
    ];

    jest.spyOn(userService, 'search').mockResolvedValue({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 10,
      nextPage: null,
      prevPage: null,
    });

    const users = await controller.search(
      { nickname: 'test', minDate: new Date(), maxDate: new Date() },
      { page: 1, pageSize: 10 },
      {sortBy: 'id', order: Order.DESC},
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
    const mockUsers = {
      id: 1,
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
      role: Role.USER,
    };

    jest.spyOn(userService, 'getById').mockResolvedValue(mockUsers);

    await controller.getById(1);

    expect(userService.getById).toHaveBeenCalledWith(1);
  });

  it('should return user profile', async () => {
    const mockUser = {
      id: 1,
      nickname: 'test',
      createdAt: new Date(),
      email: 'test',
      role: Role.USER,
    };

    jest.spyOn(userService, 'getMe').mockResolvedValue(mockUser);

    const user = await controller.getMe(req);

    expect(user).toEqual(mockUser);
    expect(userService.getMe).toHaveBeenCalledWith(2);
  });

  it('should return user products with default sorting', async () => {
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

    jest.spyOn(productService, 'getUserProducts').mockResolvedValue({
      nextPage: null,
      prevPage: null,
      page: 1,
      pageSize: 10,
      products: mockProducts,
      total: 1,
      totalPages: 1,
    });

    const products = await controller.getUserProducts(
      userId,
      {
        page: 1,
        pageSize: 10,
      },
      {sortBy: "id", order: Order.DESC},
    );

    expect(products).toEqual({
      nextPage: null,
      prevPage: null,
      page: 1,
      pageSize: 10,
      products: mockProducts,
      total: 1,
      totalPages: 1,
    });
  });

  it('should delete user', async () => {
    const res = {
      clearCookie: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;

    await controller.deleteMe(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
  });
});

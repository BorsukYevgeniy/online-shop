import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserApiController } from './user.api.controller';
import { UserService } from './user.service';
import { TokenService } from '../token/token.service';
import { Response } from 'express';
import { ProductService } from '../product/product.service';
import { AuthRequest } from '../types/request.type';
import { Role } from '../enum/role.enum';
import { Order } from '../enum/order.enum';
import { SearchUserDto } from './dto/search-user.dto';
import { UserNoCred, UserNoPassword } from './types/user.types';

const req = { user: { id: 2, role: Role.USER } } as AuthRequest;

describe('UserApiController', () => {
  let controller: UserApiController;
  let userService: UserService;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserApiController],
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

    controller = module.get<UserApiController>(UserApiController);
    userService = module.get<UserService>(UserService);
    productService = module.get<ProductService>(ProductService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(controller).toBeDefined();
  });

  describe('Should assing new admin', () => {
    const mockUser = {
      id: 1,
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
      isVerified: false,
      verifiedAt: new Date(),
    };

    it.each<[string, boolean]>([
      ['Should assing new admin', true],
      ['Should throw NotFoundException because user not found', false],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        jest.spyOn(userService, 'assignAdmin').mockResolvedValue(mockUser);

        const user = await controller.assignAdmin(1);

        expect(user).toEqual(mockUser);
      } else if (!isSuccess) {
        jest
          .spyOn(userService, 'assignAdmin')
          .mockRejectedValue(new NotFoundException());

        await expect(controller.assignAdmin(2)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });

  describe('Should search users with filters wtih default sorting', () => {
    const mockUsers = [
      {
        id: 1,
        nickname: 'test',
        createdAt: new Date(),
        role: Role.USER,
        isVerified: false,
        verifiedAt: new Date(),
      },
    ];

    it.each<[string, SearchUserDto | null]>([
      ['Should return all users with default sorting', null],
      [
        'Should return all users searched by nickname with default sorting',
        { nickname: 'test' },
      ],
      [
        'Should return all users searched by nickname and minDate with default sorting',
        { nickname: 'test', minDate: new Date() },
      ],
      [
        'Should return all users searched by nickname and maxDate with default sorting',
        { nickname: 'test', maxDate: new Date() },
      ],
      [
        'Should return all users searched by nickname and date range with default sorting',
        { nickname: 'test', minDate: new Date(), maxDate: new Date() },
      ],
    ])('%s', async (_, searchUserDto) => {
      jest.spyOn(userService, 'getAll').mockResolvedValue({
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
        users: mockUsers,
      });

      const users = await userService.getAll(
        {
          page: 1,
          pageSize: 10,
        },
        { sortBy: 'id', order: Order.DESC },
        searchUserDto,
      );

      expect(users).toEqual({
        users: mockUsers,
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        nextPage: null,
        prevPage: null,
      });

      expect(userService.getAll).toHaveBeenCalledWith(
        { page: 1, pageSize: 10 },
        {
          sortBy: 'id',
          order: Order.DESC,
        },
        searchUserDto,
      );
    });
  });

  describe('Should find user by id', () => {
    it.each<[string, UserNoCred | null]>([
      [
        'Should find user by id',
        {
          id: 1,
          nickname: 'test',
          createdAt: new Date(),
          role: Role.USER,
          isVerified: false,
          verifiedAt: new Date(),
        },
      ],
      ['Should throw NotFoundException because user not found', null],
    ])('%s', async (_, mockUser) => {
      jest.spyOn(userService, 'getById').mockResolvedValue(mockUser);

      if (mockUser) {
        const user = await controller.getById(mockUser.id);

        expect(user).toEqual(mockUser);
        expect(userService.getById).toHaveBeenCalledWith(mockUser.id);
      } else {
        jest
          .spyOn(userService, 'getById')
          .mockRejectedValue(new NotFoundException('User not found'));

        await expect(controller.getById(1)).rejects.toThrow(NotFoundException);
        expect(userService.getById).toHaveBeenCalledWith(1);
      }
    });
  });

  it('Should return user profile', async () => {
    const mockUser: UserNoPassword = {
      id: 1,
      nickname: 'test',
      createdAt: new Date(),
      email: 'test',
      role: Role.USER,
      isVerified: false,
      verifiedAt: new Date(),
      verificationLink: '123',
    };

    jest.spyOn(userService, 'getMe').mockResolvedValue(mockUser);

    const user = await controller.getMe(req);

    expect(user).toEqual(mockUser);
    expect(userService.getMe).toHaveBeenCalledWith(2);
  });

  it('Should return user products with default sorting', async () => {
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
      { sortBy: 'id', order: Order.DESC },
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

  describe('Should delete user', () => {
    const res = {
      clearCookie: jest.fn(),
      sendStatus: jest.fn(),
    } as unknown as Response;

    it('Should delete user by himself', async () => {
      await controller.deleteMe(req, res);

      expect(userService.delete).toHaveBeenCalledWith(req.user.id);
      expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    });

    it.each<[string, boolean]>([
      ['Should delete user by id', true],
      ['Should throw NotFoundException', true],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        await controller.delete(1);

        expect(userService.delete).toHaveBeenCalledWith(1);
      } else {
        jest
          .spyOn(userService, 'delete')
          .mockRejectedValue(new NotFoundException());

        expect(controller.delete).rejects.toThrow(NotFoundException);
      }
    });
  });
});

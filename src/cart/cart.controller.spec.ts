import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Product } from '@prisma/client';
import { CartController } from './cart.controller';
import { Role } from '../enum/role.enum';
import { AuthRequest } from '../types/request.type';
import { TokenService } from '../token/token.service';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            getCart: jest.fn(),
            getMyCart: jest.fn(),
            addToCart: jest.fn(),
            removeFromCart: jest.fn(),
            clearCart: jest.fn(),
          },
        },
        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  const req = {
    user: { id: 1, role: Role.USER, isVerified: true },
  } as AuthRequest;

  it('Should be defined', async () => {
    expect(controller).toBeDefined();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe('Should return cart', () => {
    it.each([
      ['Should return a cart', true],
      ['Should throw NotFoundException if cart is not found', false],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        const mockCart = { id: 1, userId: 2, products: [{} as Product] };
        jest.spyOn(service, 'getCart').mockResolvedValue(mockCart);

        const result = await controller.getCart(1);
        expect(result).toEqual(mockCart);
      } else {
        jest
          .spyOn(service, 'getCart')
          .mockRejectedValue(new NotFoundException(''));

        await expect(controller.getCart(1)).rejects.toThrow(NotFoundException);
      }
    });
  });

  it('Should return a user cart', async () => {
    const mockCart = { id: 1, userId: 2, products: [{} as Product] };
    jest.spyOn(service, 'getMyCart').mockResolvedValue(mockCart);

    const result = await controller.getMyCart(req);
    expect(result).toEqual(mockCart);
  });

  describe('Should add product to cart', () => {
    it.each([
      ['Should add a product to the cart', true],
      ['Should throw BadRequestException if product is not found', false],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        const mockCart = { id: 1, userId: 1, products: [{ id: 1 } as Product] };
        jest.spyOn(service, 'addToCart').mockResolvedValue(mockCart);

        const result = await controller.addToCart(req, 1);
        expect(result).toEqual(mockCart);
      } else {
        jest
          .spyOn(service, 'addToCart')
          .mockRejectedValue(new BadRequestException(''));

        await expect(controller.addToCart(req, 1)).rejects.toThrow(
          BadRequestException,
        );
      }
    });
  });

  it('Should remove a product from the cart', async () => {
    const mockCart = { id: 1, userId: 1, products: [] };

    jest.spyOn(service, 'removeFromCart').mockResolvedValue(mockCart);

    const result = await controller.removeFromCart(req, 1);
    expect(result).toEqual(mockCart);
  });

  it('Should clear a cart', async () => {
    const mockCart = { id: 1, userId: 1, products: [] };

    jest.spyOn(service, 'clearCart').mockResolvedValue(mockCart);

    const result = await controller.clearCart(req);
    expect(result).toEqual(mockCart);
  });
});

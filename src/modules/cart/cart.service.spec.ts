import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Product } from '@prisma/client';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: CartRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepository,
          useValue: {
            findCartById: jest.fn(),
            findMyCart: jest.fn(),
            addToCart: jest.fn(),
            removeFromCart: jest.fn(),
            clearCart: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get<CartRepository>(CartRepository);
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
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
        jest.spyOn(cartRepository, 'findCartById').mockResolvedValue(mockCart);

        const result = await service.getCart(1);
        expect(result).toEqual(mockCart);
      } else {
        jest.spyOn(cartRepository, 'findCartById').mockResolvedValue(null);

        await expect(service.getCart(1)).rejects.toThrow(NotFoundException);
      }
    });
  });

  it('Should return a user cart', async () => {
    const mockCart = { id: 1, userId: 2, products: [{} as Product] };
    jest.spyOn(cartRepository, 'findMyCart').mockResolvedValue(mockCart);

    const result = await service.getMyCart(1);
    expect(result).toEqual(mockCart);
  });

  describe('Should add product to cart', () => {
    it.each([
      ['Should add a product to the cart', true],
      ['Should throw BadRequestException if product is not found', false],
    ])('%s', async (_, isSuccess) => {
      if (isSuccess) {
        const mockCart = { id: 1, userId: 1, products: [{ id: 1 } as Product] };
        jest.spyOn(cartRepository, 'addToCart').mockResolvedValue(mockCart);

        const result = await service.addToCart(1, 1);
        expect(result).toEqual(mockCart);
      } else {
        jest.spyOn(cartRepository, 'addToCart').mockRejectedValue(
          new PrismaClientKnownRequestError('error', {
            code: '123',
            clientVersion: '',
          }),
        );

        await expect(service.addToCart(1, 1)).rejects.toThrow(
          BadRequestException,
        );
      }
    });
  });

  it('Should remove a product from the cart', async () => {
    const mockCart = { id: 1, userId: 1, products: [] };

    jest.spyOn(cartRepository, 'removeFromCart').mockResolvedValue(mockCart);

    const result = await service.removeFromCart(1, 1);
    expect(result).toEqual(mockCart);
  });

  it('Should clear a cart', async () => {
    const mockCart = { id: 1, userId: 1, products: [] };

    jest.spyOn(cartRepository, 'clearCart').mockResolvedValue(mockCart);

    const result = await service.clearCart(1);
    expect(result).toEqual(mockCart);
  });
});

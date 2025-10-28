import { Test, TestingModule } from '@nestjs/testing';
import { CartRepository } from './cart.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('CartRepository', () => {
  let cartRepository: CartRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartRepository,
        {
          provide: PrismaService,
          useValue: { cart: { update: jest.fn(), findUnique: jest.fn() } },
        },
      ],
    }).compile();

    cartRepository = module.get<CartRepository>(CartRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('Should be defined', () => {
    expect(cartRepository).toBeDefined();
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should return the user cart', async () => {
    const userId = 1;
    const mockCart = { id: 1, userId, products: [] };
    jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue(mockCart);

    const result = await cartRepository.findMyCart(userId);

    expect(prismaService.cart.findUnique).toHaveBeenCalledWith({
      where: { userId },
      include: { products: true },
    });
    expect(result).toEqual(mockCart);
  });

  it('Should return the cart by ID', async () => {
    const cartId = 1;
    const mockCart = { id: cartId, userId: 1, products: [] };
    jest.spyOn(prismaService.cart, 'findUnique').mockResolvedValue(mockCart);

    const result = await cartRepository.findCartById(cartId);

    expect(prismaService.cart.findUnique).toHaveBeenCalledWith({
      where: { id: cartId },
      include: { products: true },
    });
    expect(result).toEqual(mockCart);
  });

  it('Should add a product to the cart', async () => {
    const userId = 1;
    const productId = 2;
    const mockCart = { id: 1, userId, products: [] };
    jest.spyOn(prismaService.cart, 'update').mockResolvedValue(mockCart);

    const result = await cartRepository.addToCart(productId, userId);

    expect(prismaService.cart.update).toHaveBeenCalledWith({
      where: { userId },
      data: { products: { connect: { id: productId } } },
      include: { products: true },
    });
    expect(result).toEqual(mockCart);
  });

  it('Should remove a product from the cart', async () => {
    const userId = 1;
    const productId = 2;
    const mockCart = { id: 1, userId, products: [] };
    jest.spyOn(prismaService.cart, 'update').mockResolvedValue(mockCart);

    const result = await cartRepository.removeFromCart(productId, userId);

    expect(prismaService.cart.update).toHaveBeenCalledWith({
      where: { userId },
      data: { products: { disconnect: { id: productId } } },
      include: { products: true },
    });
    expect(result).toEqual(mockCart);
  });

  it('Should clear all products from the cart', async () => {
    const userId = 1;
    const mockCart = { id: 1, userId, products: [] };
    jest.spyOn(prismaService.cart, 'update').mockResolvedValue(mockCart);

    const result = await cartRepository.clearCart(userId);

    expect(prismaService.cart.update).toHaveBeenCalledWith({
      where: { userId },
      data: { products: { set: [] } },
      include: { products: true },
    });
    expect(result).toEqual(mockCart);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { ProductService } from '../product/product.service';
import { RoleService } from '../roles/role.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let productService: ProductService;
  let roleService: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findOneByEmail: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ProductService,
          useValue: {
            findUserProducts: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            getRoleByValue: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    productService = module.get<ProductService>(ProductService);
    roleService = module.get<RoleService>(RoleService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all users', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test@example.com',
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

    jest.spyOn(userRepository, 'findAll').mockResolvedValue(mockUsers);

    expect(await service.findAll()).toBe(mockUsers);
    expect(userRepository.findAll).toHaveBeenCalled();
  });

  it('should find user by id', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
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

    jest.spyOn(userRepository, 'findById').mockResolvedValue(mockUser);

    const user = await service.findById(1);
    expect(user).toEqual(mockUser);
  });

  it('should throw NotFoundException if user not found by id', async () => {
    jest.spyOn(userRepository, 'findById').mockResolvedValue(null);

    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    expect(userRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should find user products by user id', async () => {
    const products = [
      {
        id: 1,
        name: 'Product 1',
        userId: 1,
        price: 100,
        description: 'Product description',
        title: 'ds',
        images: ['1'],
      },
    ];
    jest.spyOn(productService, 'findUserProducts').mockResolvedValue(products);

    const userProducts = await service.findUserProducts(1);

    expect(userProducts).toEqual(products);
  });

  it('should find user by email', async () => {
    const email = 'test@example.com';
    const mockUser = {
      id: 1,
      email,
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
    jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(mockUser);

    const user = await service.findByEmail(email);

    expect(user).toEqual(mockUser);
  });

  it('should create a new user', async () => {
    const dto: CreateUserDto = { email: 'test@test.com', password: 'password' };
    const userRole = { id: 1, value: 'USER', description: 'User role' };
    const mockUser = {
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
          id: 1,
          value: 'admin',
          description: 'Administrator role',
        },
      ],
    };
    jest.spyOn(roleService, 'getRoleByValue').mockResolvedValue(userRole);
    jest.spyOn(userRepository, 'create').mockResolvedValue(mockUser);

    const user = await service.create(dto);

    expect(user).toEqual(mockUser);
    expect(roleService.getRoleByValue).toHaveBeenCalledWith('USER');
    expect(userRepository.create).toHaveBeenCalledWith(
      dto.email,
      dto.password,
      userRole.id,
    );
  });
  it('should delete a user by id', async () => {
    const userId = 1;
    const mockUser = {
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
          id: 1,
          value: 'admin',
          description: 'Administrator role',
        },
      ],
    };

    jest.spyOn(userRepository, 'delete').mockResolvedValue(mockUser);

    const user = await service.delete(userId);

    expect(user).toEqual(mockUser);
    expect(userRepository.delete).toHaveBeenCalledWith(1);
  });
});

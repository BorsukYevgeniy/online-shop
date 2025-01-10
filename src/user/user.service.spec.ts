import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { RoleService } from '../roles/role.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;
  let roleService: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            assignAdmin: jest.fn(),
            count: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            findUserProducts: jest.fn(),
            findUserProfile: jest.fn(),
            findOneByEmail: jest.fn(),
            findUserRoles: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
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
    repository = module.get<UserRepository>(UserRepository);
    roleService = module.get<RoleService>(RoleService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
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

    jest.spyOn(repository, 'findUserRoles').mockResolvedValue(mockUser.roles);
    jest.spyOn(repository, 'assignAdmin').mockResolvedValue(mockUser);

    const user = await service.assignAdmin(1);

    expect(user).toEqual(mockUser);
  });

  it('should find all users without filters', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'test@example.com',
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
      },
    ];

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockUsers);

    const users = await service.findAll({ page: 1, pageSize: 10 }, {});

    expect(users).toEqual({
      users: mockUsers,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      nextPage: null,
      prevPage: null,
    });
    expect(repository.findAll).toHaveBeenCalled();
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

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockUsers);

    const users = await service.findAll(
      { page: 1, pageSize: 10 },
      { nickname: 'test' },
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

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockUsers);

    const users = await service.findAll(
      { page: 1, pageSize: 10 },
      { minDate: new Date(), maxDate: new Date() },
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

    jest.spyOn(repository, 'count').mockResolvedValue(1);
    jest.spyOn(repository, 'findAll').mockResolvedValue(mockUsers);

    const users = await service.findAll(
      { page: 1, pageSize: 10 },
      { nickname: 'test', minDate: new Date(), maxDate: new Date() },
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
  });

  it('should find user by id with email', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
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

    jest.spyOn(repository, 'findById').mockResolvedValue(mockUser);

    const user = await service.findById(1);
    expect(user).toEqual(mockUser);
  });

  it('should find user profile', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
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

    jest.spyOn(repository, 'findUserProfile').mockResolvedValue(mockUser);

    const user = await service.findUserProfile(1);
    expect(user).toEqual(mockUser);
  });

  it('should throw NotFoundException if user not found by id', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    expect(repository.findById).toHaveBeenCalledWith(1);
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
    jest.spyOn(repository, 'findUserProducts').mockResolvedValue(products);

    const userProducts = await service.findUserProducts(1);

    expect(userProducts).toEqual(products);
  });

  it('should find user by email', async () => {
    const email = 'test@example.com';
    const mockUser = {
      id: 1,
      email,
      password: 'password',
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
    jest.spyOn(repository, 'findOneByEmail').mockResolvedValue(mockUser);

    const user = await service.findByEmail(email);

    expect(user).toEqual(mockUser);
  });

  it('should create a new user', async () => {
    const dto: CreateUserDto = {
      email: 'test@test.com',
      nickname: 'test',
      password: 'password',
    };
    const userRole = { id: 1, value: 'USER', description: 'User role' };
    const mockUser = {
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
      roles: [
        {
          id: 1,
          value: 'admin',
          description: 'Administrator role',
        },
      ],
    };

    jest.spyOn(roleService, 'getRoleByValue').mockResolvedValue(userRole);
    jest.spyOn(repository, 'create').mockResolvedValue(mockUser);

    const user = await service.create(dto);

    expect(user).toEqual(mockUser);
    expect(roleService.getRoleByValue).toHaveBeenCalledWith('USER');
    expect(repository.create).toHaveBeenCalledWith(
      dto.email,
      dto.nickname,
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

    jest.spyOn(repository, 'delete').mockResolvedValue(mockUser);

    const user = await service.delete(userId);

    expect(user).toEqual(mockUser);
    expect(repository.delete).toHaveBeenCalledWith(1);
  });
});

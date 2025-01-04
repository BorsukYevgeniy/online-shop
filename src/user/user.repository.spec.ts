import { Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { TestingModule, Test } from '@nestjs/testing';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('should get all users', async () => {
    const mockUsersFromDb = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        createdAt: new Date(),

        password: '12345',
        products: [{}],
        roles: [
          {
            role: { id: 1, value: 'Admin', description: 'Administrator role' },
          },
        ],
      },
    ];

    const mockUsers = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        createdAt: new Date(),

        password: '12345',
        products: [{} as Product],
        roles: [{ id: 1, value: 'Admin', description: 'Administrator role' }],
      },
    ];

    jest
      .spyOn(prismaService.user, 'findMany')
      .mockResolvedValue(mockUsersFromDb);

    const users = await repository.findAll(0, 10);

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                value: true,
                description: true,
              },
            },
          },
        },
      },
      skip: 0,
      take: 10,
    });

    expect(users).toEqual(mockUsers);
  });

  it('should find user by id', async () => {
    const userId = 1;

    const mockUserFromDb = {
      id: userId,
      email: 'email',
      products: [{}],
      roles: [
        { role: { id: 1, value: 'Admin', description: 'Administrator role' } },
      ],
    };

    const mockUser = {
      id: userId,
      email: 'email',
      products: [{}],
      roles: [{ id: 1, value: 'Admin', description: 'Administrator role' }],
    };

    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(mockUserFromDb as any);

    const user = await repository.findById(userId);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        products: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                value: true,
                description: true,
              },
            },
          },
        },
      },
    });

    expect(user).toEqual(mockUser);
  });

  it('should find user by email', async () => {
    const email = 'email';

    const mockUserFromDb = {
      id: 1,
      email,
      nickname: 'test',
      createdAt: new Date(),

      password: '12345',
      products: [{}],
      roles: [
        { role: { id: 1, value: 'Admin', description: 'Administrator role' } },
      ],
    };

    const mockUser = {
      id: 1,
      email,
      nickname: 'test',
      createdAt: new Date(),

      password: '12345',
      products: [{}],
      roles: [{ id: 1, value: 'Admin', description: 'Administrator role' }],
    };

    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(mockUserFromDb);

    const user = await repository.findOneByEmail(email);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email },
      include: {
        roles: {
          select: {
            role: { select: { id: true, value: true, description: true } },
          },
        },
      },
    });

    expect(user).toEqual(mockUser);
  });

  it('should create a new user', async () => {
    const email = 'email';
    const nickname = 'test';
    const roleId = 1;
    const password = '12345';

    const mockUserFromDb = {
      id: 1,
      email,
      roles: [{ role: { id: roleId, value: 'admin', description: 'admin' } }],
    };

    const mockUser = {
      id: 1,
      email,
      roles: [{ id: roleId, value: 'admin', description: 'admin' }],
    };

    jest
      .spyOn(prismaService.user, 'create')
      .mockResolvedValue(mockUserFromDb as any);

    const user = await repository.create(email, nickname, password, roleId);

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        email,
        password,
        nickname,
        roles: {
          create: [{ role: { connect: { id: roleId } } }],
        },
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        roles: {
          select: {
            role: { select: { id: true, value: true, description: true } },
          },
        },
      },
    });
    expect(user).toEqual(mockUser);
  });

  it('should delete user by id', async () => {
    const userId = 1;

    const mockUserFromDb = {
      id: userId,
      email: 'user@example.com',
      products: [{}],
      roles: [
        { role: { id: 1, value: 'Admin', description: 'Administrator role' } },
      ],
    };

    const mockUser = {
      id: userId,
      email: 'user@example.com',
      products: [{}],
      roles: [{ id: 1, value: 'Admin', description: 'Administrator role' }],
    };

    jest
      .spyOn(prismaService.user, 'delete')
      .mockResolvedValue(mockUserFromDb as any);

    const user = await repository.delete(userId);

    expect(prismaService.user.delete).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        products: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                value: true,
                description: true,
              },
            },
          },
        },
      },
    });

    expect(user).toEqual(mockUser);
  });
});

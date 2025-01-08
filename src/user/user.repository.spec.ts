import { Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { TestingModule, Test } from '@nestjs/testing';

describe('UserRepository', () => {
  const date = new Date();

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
              count: jest.fn(),
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

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('should count all users without filters', async () => {
    jest.spyOn(prismaService.user, 'count').mockResolvedValue(10);

    const result = await repository.count({});

    expect(result).toBe(10);
    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: undefined,
          lte: undefined,
        },
        nickname: {
          contains: undefined,
          mode: 'insensitive',
        },
      },
    });
  });

  it('should count users filtered by nickname', async () => {
    jest.spyOn(prismaService.user, 'count').mockResolvedValue(5);

    const result = await repository.count({ nickname: 'John' });
    expect(result).toBe(5);
    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        nickname: { contains: 'John', mode: 'insensitive' },
        createdAt: { lte: undefined, gte: undefined },
      },
    });
  });

  it('should count users filtered by date range', async () => {
    jest.spyOn(prismaService.user, 'count').mockResolvedValue(3);

    const result = await repository.count({
      minDate: date,
      maxDate: date,
    });
    expect(result).toBe(3);
    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        nickname: {
          contains: undefined,
          mode: 'insensitive',
        },
        createdAt: {
          gte: date,
          lte: date,
        },
      },
    });
  });

  it('should count users filtered by nickname and date range', async () => {
    jest.spyOn(prismaService.user, 'count').mockResolvedValue(2);

    const result = await repository.count({
      nickname: 'test',
      minDate: date,
      maxDate: date,
    });

    expect(result).toBe(2);
    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        nickname: { contains: 'test', mode: 'insensitive' },
        createdAt: {
          gte: date,
          lte: date,
        },
      },
    });
  });

  it('should get all users without filters', async () => {
    const mockUsersFromDb = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        createdAt: date,

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
        createdAt: date,

        password: '12345',
        products: [{} as Product],
        roles: [{ id: 1, value: 'Admin', description: 'Administrator role' }],
      },
    ];

    jest
      .spyOn(prismaService.user, 'findMany')
      .mockResolvedValue(mockUsersFromDb);

    const users = await repository.findAll({}, 0, 10);

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: undefined,
          lte: undefined,
        },
        nickname: {
          contains: undefined,
          mode: 'insensitive',
        },
      },

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

  it('should get all users filtered by nickname', async () => {
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

    const users = await repository.findAll({ nickname: 'test' }, 0, 10);

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        nickname: { contains: 'test', mode: 'insensitive' },
        createdAt: {
          gte: undefined,
          lte: undefined,
        },
      },

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

  it('should get all users filtered and date range', async () => {
    const mockUsersFromDb = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        createdAt: date,

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
        createdAt: date,

        password: '12345',
        products: [{} as Product],
        roles: [{ id: 1, value: 'Admin', description: 'Administrator role' }],
      },
    ];

    jest
      .spyOn(prismaService.user, 'findMany')
      .mockResolvedValue(mockUsersFromDb);

    const users = await repository.findAll(
      {
        minDate: date,
        maxDate: date,
      },
      0,
      10,
    );

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        nickname: { contains: undefined, mode: 'insensitive' },
        createdAt: {
          gte: date,
          lte: date,
        },
      },

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

  it('should get all users filtered by nickname and date range', async () => {
    const mockUsersFromDb = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        createdAt: date,

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
        createdAt: date,

        password: '12345',
        products: [{} as Product],
        roles: [{ id: 1, value: 'Admin', description: 'Administrator role' }],
      },
    ];

    jest
      .spyOn(prismaService.user, 'findMany')
      .mockResolvedValue(mockUsersFromDb);

    const users = await repository.findAll(
      {
        nickname: 'test',
        minDate: date,
        maxDate: date,
      },
      0,
      10,
    );

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        nickname: { contains: 'test', mode: 'insensitive' },
        createdAt: {
          gte: date,
          lte: date,
        },
      },

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
      createdAt: date,

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
      createdAt: date,

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

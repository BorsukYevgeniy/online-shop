import { Product, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { TestingModule, Test } from '@nestjs/testing';
import Role from '../enum/role.enum';

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
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
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

  it('should assing new admin', async () => {
    const mockUsers = {
      id: 1,
      nickname: 'test',
      createdAt: date,
      role: Role.USER,
    };

    jest
      .spyOn(prismaService.user, 'update')
      .mockResolvedValue(mockUsers as any);

    const user = await repository.assignAdmin(1);

    expect(user).toEqual(mockUsers);
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

  it('should get all users', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        password: 'test',
        createdAt: date,

        role: Role.USER,
      },
    ];

    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

    const users = await repository.findAll(0, 10);

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
      },
      skip: 0,
      take: 10,
    });

    expect(users).toEqual(mockUsers);
  });

  it('should get all users searched by nickname', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        password: 'password',
        createdAt: date,
        products: [{} as Product],
        role: Role.USER,
      },
    ];

    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

    const users = await repository.findUsers({ nickname: 'test' }, 0, 10);

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
        nickname: true,
        createdAt: true,

        role: true,
      },
      skip: 0,
      take: 10,
    });

    expect(users).toEqual(mockUsers);
  });

  it('should get all users searched nickname and date range', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        createdAt: date,
        password: 'password',
        products: [{} as Product],
        role: Role.USER,
      },
    ];

    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

    const users = await repository.findUsers(
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
        nickname: true,
        createdAt: true,

        role: true,
      },
      skip: 0,
      take: 10,
    });

    expect(users).toEqual(mockUsers);
  });

  it('should find user by id', async () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      email: 'email',
      products: [{}],
      role: Role.USER,
    };

    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(mockUser as any);

    const user = await repository.findById(userId);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        createdAt: true,
        role: true,
      },
    });

    expect(user).toEqual(mockUser);
  });

  it('should find user profile', async () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      email: 'email',
      products: [{}],
      role: Role.USER,
    };

    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(mockUser as any);

    const user = await repository.findUserProfile(userId);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    expect(user).toEqual(mockUser);
  });

  it('should find user by email', async () => {
    const email = 'email';
    const mockUser = {
      id: 1,
      email,
      nickname: 'test',
      password: 'test',
      createdAt: date,
      products: [{}],
      role: Role.USER,
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

    const user = await repository.findOneByEmail(email);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email },
    });

    expect(user).toEqual(mockUser);
  });

  it('should create a new user', async () => {
    const email = 'email';
    const nickname = 'test';
    const password = '12345';

    const mockUser = {
      id: 1,
      email,
      role: Role.USER,
    };

    jest
      .spyOn(prismaService.user, 'create')
      .mockResolvedValue(mockUser as User);

    const user = await repository.create(email, nickname, password);

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        email,
        nickname,
        password,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        role: true,
      },
    });

    expect(user).toEqual(mockUser);
  });

  it('should delete user by id', async () => {
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      products: [{}],
      role: Role.USER,
    };

    jest.spyOn(prismaService.user, 'delete').mockResolvedValue(mockUser as any);

    const user = await repository.delete(1);

    expect(prismaService.user.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });
});

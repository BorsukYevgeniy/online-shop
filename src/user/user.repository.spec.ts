import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { TestingModule, Test } from '@nestjs/testing';
import { Role } from '../common/enum/role.enum';
import { Order } from '../common/enum/order.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { UserNoPasswordVLink } from './types/user.types';
import { dmmfToRuntimeDataModel } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';

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

  it('Should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('Should assing new admin', async () => {
    const mockUsers = {
      id: 1,
      nickname: 'test',
      email: 'email',
      password: '123',
      createdAt: date,
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };

    jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUsers);

    const user = await repository.assignAdmin(1);

    expect(user).toEqual(mockUsers);
  });

  describe('Should count users with filters', () => {
    it.each<[string, SearchUserDto | null]>([
      ['Should count all users without filters', null],
      ['Should count users filtered by nickname', { nickname: 'John' }],
      [
        'Should count users filtered by nickname and min date',
        { nickname: 'test', minDate: date },
      ],
      [
        'Should count users filtered by nickname and max date',
        { nickname: 'test', maxDate: date },
      ],
      [
        'Should count users filtered by nickname and date range',
        { nickname: 'test', minDate: date, maxDate: date },
      ],
    ])('%s', async (_, searchUserDto) => {
      jest.spyOn(prismaService.user, 'count').mockResolvedValue(5);

      const result = await repository.count(searchUserDto);

      expect(result).toEqual(5);
      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: {
          nickname: { contains: searchUserDto?.nickname, mode: 'insensitive' },
          createdAt: {
            gte: searchUserDto?.minDate,
            lte: searchUserDto?.maxDate,
          },
        },
      });
    });
  });

  describe('Should search users with filters with default sorting', () => {
    const mockUsers = [
      {
        id: 1,
        email: 'email',
        nickname: 'test',
        password: 'password',
        createdAt: date,
        role: Role.USER,
        isVerified: false,
        verifiedAt: null,
        verificationLink: '123',
      },
    ];

    it.each<[string, SearchUserDto | null]>([
      ['Should search user by nickname with default sorting', null],
      [
        'Should search user by nickname with default sorting',
        { nickname: 'test' },
      ],
      [
        'Should search user by nickname and min date with default sorting',
        { nickname: 'test', minDate: date },
      ],
      [
        'Should search user by nickname and max date with default sorting',
        { nickname: 'test', maxDate: date },
      ],
      [
        'Should search user by nickname and date range with default sorting',
        { nickname: 'test', minDate: date, maxDate: date },
      ],
    ])('%s', async (_, searchUserDto) => {
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

      const users = await repository.findAll(
        0,
        10,
        { sortBy: 'id', order: Order.DESC },
        searchUserDto,
      );

      expect(users).toEqual(mockUsers);

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          nickname: true,
          createdAt: true,
          verifiedAt: true,
          isVerified: true,
          role: true,
        },
        skip: 0,
        take: 10,
        orderBy: {
          id: 'desc',
        },
        where: {
          nickname: { contains: searchUserDto?.nickname, mode: 'insensitive' },
          createdAt: {
            gte: searchUserDto?.minDate,
            lte: searchUserDto?.maxDate,
          },
        },
      });
    });
  });

  it('Should find user by id', async () => {
    const mockUser = {
      id: 1,
      nickname: 'test',
      createdAt: date,
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };

    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(mockUser as User);

    const user = await repository.findById(1);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: {
        createdAt: true,
        id: true,
        isVerified: true,
        nickname: true,
        role: true,
        verifiedAt: true,
      },
    });

    expect(user).toEqual(mockUser);
  });

  it('Should find full user by id', async () => {
    const mockUser = {
      id: 1,
      nickname: '123',
      email: '123',
      password: 'test',
      createdAt: date,
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };

    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(mockUser as User);

    const user = await repository.findById(1);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: {
        createdAt: true,
        id: true,
        isVerified: true,
        nickname: true,
        role: true,
        verifiedAt: true,
      },
    });

    expect(user).toEqual(mockUser);
  });

  it('Should find user by email', async () => {
    const email = 'email';
    const mockUser = {
      id: 1,
      email,
      nickname: 'test',
      password: 'test',
      createdAt: date,
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

    const user = await repository.findOneByEmail(email);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email },

      select: {
        email: true,
        id: true,
        isVerified: true,
        password: true,
        role: true,
        verificationLink: true,
      },
    });

    expect(user).toEqual(mockUser);
  });

  it('Should find user by verification link', async () => {
    const mockUser = {
      id: 1,
      email: 'emai',
      password: 'password',
      nickname: 'test',
      createdAt: new Date(),
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

    const user = await repository.findOneByVerificationLink('123');

    expect(user).toEqual(mockUser);
  });

  it('Should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      email: 'email',
      nickname: 'nick',
      password: '1234',
    };

    jest.spyOn(prismaService.user, 'create').mockResolvedValue({
      id: 1,
      role: Role.USER,
      ...createUserDto,
      createdAt: date,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    });

    const user: UserNoPasswordVLink = await repository.create(createUserDto);

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: { ...createUserDto, cart: { create: {} } },
      select: {
        id: true,
        email: true,
        nickname: true,
        createdAt: true,
        isVerified: true,
        verifiedAt: true,
        verificationLink: true,
        role: true,
      },
    });

    expect(user).toEqual({
      id: 1,
      role: Role.USER,
      ...createUserDto,
      createdAt: date,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    });
  });

  it('Should delete user by id', async () => {
    const mockUser = {
      id: 1,
      nickname: 'nick',
      email: 'user@example.com',
      password: '1234',
      role: Role.USER,
      createdAt: date,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };

    jest.spyOn(prismaService.user, 'delete').mockResolvedValue(mockUser);

    await repository.delete(1);

    expect(prismaService.user.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('Should verify user', async () => {
    const mockUser = {
      id: 1,
      email: 'email',
      nickname: 'test',
      password: 'password',
      createdAt: date,
      role: Role.USER,
      isVerified: false,
      verifiedAt: null,
      verificationLink: '123',
    };

    jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

    const user = await repository.verify('123');

    expect(user).toEqual(mockUser);
  });
});

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

  it('should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('should get all users', async () => {
    const mockUsers = [
      { id: 1, email: 'email', password: '12345', products: [{}], roles: [{}] },
    ];

    jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(mockUsers);

    const users = await repository.findAll();

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
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
    expect(users).toEqual(mockUsers);
  });

  it('should find user by id', async () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      email: 'email',
      password: '12345',
      products: [{}],
      roles: [{}],
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

    const user = await repository.findById(userId);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        email: true,
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
    const mockUser = {
      id: 1,
      email,
      password: '12345',
      products: [{}],
      roles: [{}],
    };

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

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
    const password = '1234';
    const roleId = 1;

    const mockUser = {
      id: 1,
      email,
      password,
      roles: [{ id: roleId, value: 'admin', description: 'admin' }],
    };

    jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);

    const user = await repository.create(email, password, roleId);

    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        email,
        password,
        roles: {
          create: [{ role: { connect: { id: roleId } } }],
        },
      },
    });
    expect(user).toEqual(mockUser);
  });

  it('should delete user by id', async () => {
    const userId = 1;

    const mockUser = {
      id: userId,
      email: 'email',
      password: '12345',
      products: [{}],
      roles: [{}],
    };

    jest.spyOn(prismaService.user, 'delete').mockResolvedValue(mockUser);

    const user = await repository.delete(userId);

    expect(prismaService.user.delete).toHaveBeenCalledWith({
      where: { id: userId },
      include: {
        products: true,
        roles: {
          select: {
            role: { select: { id: true, value: true, description: true } },
          },
        },
      },
    });

    expect(user).toEqual(mockUser);
  });
});

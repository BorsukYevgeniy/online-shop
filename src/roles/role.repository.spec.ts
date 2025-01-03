import { RoleRepository } from './role.repository';
import { Test } from '@nestjs/testing';
import { CreateRoleDto } from './dto/create-role.dto';
import { PrismaService } from '../prisma/prisma.service';

describe('RoleRepository', () => {
  let repository: RoleRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RoleRepository,
        {
          provide: PrismaService,
          useValue: {
            role: {
              create: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<RoleRepository>(RoleRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });
  
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('should get role by value', async () => {
    const getRoleData = { value: 'TEST' };
    const mockRole = {
      id: 1,
      value: getRoleData.value,
      description: 'Test description',
    };

    jest.spyOn(prisma.role, 'findUnique').mockResolvedValue(mockRole);

    const role = await repository.findByValue(getRoleData.value);
    expect(prisma.role.findUnique).toHaveBeenCalledWith({
      where: { value: getRoleData.value },
    });

    expect(role).toEqual(mockRole);
  });

  it('should crate new role', async () => {
    const createRoleDto: CreateRoleDto = {
      value: 'TEST',
      description: 'Test description',
    };

    const mockRole = {
      id: 1,
      ...createRoleDto,
    };

    jest.spyOn(prisma.role, 'create').mockResolvedValue(mockRole);

    const role = await repository.createRole(
      createRoleDto.value,
      createRoleDto.description,
    );

    expect(prisma.role.create).toHaveBeenCalledWith({
      data: {
        value: createRoleDto.value,
        description: createRoleDto.description,
      },
    });

    expect(role).toEqual(mockRole);
  });

  it('should delete role by value', async () => {
    const deleteRoleData = { value: 'TEST' };
    const mockRole = {
      id: 1,
      value: deleteRoleData.value,
      description: 'Test Secription',
    };

    jest.spyOn(prisma.role, 'delete').mockResolvedValue(mockRole);

    const role = await repository.deleteRoleByValue(deleteRoleData.value);

    expect(prisma.role.delete).toHaveBeenCalledWith({
      where: { value: deleteRoleData.value },
    });

    expect(role).toEqual(mockRole);
  });
});

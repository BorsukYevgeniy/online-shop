import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';

describe('RoleService', () => {
  let service: RoleService;
  let repository: RoleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: RoleRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByValue: jest.fn(),
            deleteRoleByValue: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    repository = module.get<RoleRepository>(RoleRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should get a role by value', async () => {
    const getRoleData = { value: 'TEST' };
    const mockRole = {
      id: 1,
      value: getRoleData.value,
      description: 'Test description',
    };

    jest.spyOn(repository, 'findByValue').mockResolvedValue(mockRole);

    const role = await service.getRoleByValue(getRoleData.value);

    expect(repository.findByValue).toHaveBeenCalledWith(getRoleData.value);

    expect(role).toEqual(mockRole);
  });

  it('should get a role by id', async () => {
    const mockRole = {
      id: 1,
      value: 'TEST',
      description: 'Test description',
    };

    jest.spyOn(repository, 'findById').mockResolvedValue(mockRole);

    const role = await service.getRoleById(1);

    expect(repository.findById).toHaveBeenCalledWith(1);

    expect(role).toEqual(mockRole);
  });

  it('should create a new role', async () => {
    const roleDto: CreateRoleDto = {
      value: 'TEST',
      description: 'Test description',
    };

    const mockRole = {
      id: 1,
      value: roleDto.value,
      description: roleDto.description,
    };

    jest.spyOn(repository, 'create').mockResolvedValue(mockRole);

    const role = await service.create(roleDto);

    expect(repository.create).toHaveBeenCalledWith(
      roleDto.value,
      roleDto.description,
    );

    expect(role).toEqual(mockRole);
  });

  it('should delete role by value', async () => {
    const roleValue = 'TEST';

    await service.deleteRoleByValue(roleValue);

    expect(repository.deleteRoleByValue).toHaveBeenCalledWith(roleValue);
  });
});

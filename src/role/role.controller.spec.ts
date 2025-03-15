import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { TokenService } from '../token/token.service';

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: RoleService,
          useValue: {
            getRoleById: jest.fn(),
            getRoleByValue: jest.fn(),
            create: jest.fn(),
            deleteRoleByValue: jest.fn(),
          },
        },

        {
          provide: TokenService,
          useValue: {
            verifyAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    controller = module.get<RoleController>(RoleController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('should get a role by id', async () => {
    const mockRole = {
      id: 1,
      value: 'TEST',
      description: 'Test description',
    };

    jest.spyOn(service, 'getRoleById').mockResolvedValue(mockRole);

    const role = await controller.getRoleById(1);

    expect(service.getRoleById).toHaveBeenCalledWith(1);

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

    jest.spyOn(service, 'create').mockResolvedValue(mockRole);

    const role = await controller.create(roleDto);

    expect(service.create).toHaveBeenCalledWith({
      description: roleDto.description,
      value: roleDto.value,
    });

    expect(role).toEqual(mockRole);
  });

  it('should delete role by value', async () => {
    const roleValue = 'TEST';

    await controller.deleteRoleByValue(roleValue);

    expect(service.deleteRoleByValue).toHaveBeenCalledWith(roleValue);
  });
});

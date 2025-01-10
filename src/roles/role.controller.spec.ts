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
            getRoleByValue: jest.fn(),
            createRole: jest.fn(),
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

  it('should get a role by value', async () => {
    const getRoleData = { value: 'TEST' };
    const mockRole = {
      id: 1,
      value: getRoleData.value,
      description: 'Test description',
    };

    jest.spyOn(service, 'getRoleByValue').mockResolvedValue(mockRole);

    const role = await controller.getRoleByValue(getRoleData.value);

    expect(service.getRoleByValue).toHaveBeenCalledWith(getRoleData.value);

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

    jest.spyOn(service, 'createRole').mockResolvedValue(mockRole);

    const role = await controller.createRole(roleDto);

    expect(service.createRole).toHaveBeenCalledWith({
      description: roleDto.description,
      value: roleDto.value,
    });

    expect(role).toEqual(mockRole);
  });

  it('should delete role by value', async () => {
    const deleteRoleData = { value: 'TEST' };
    const mockRole = {
      id: 1,
      value: deleteRoleData.value,
      description: 'Test description',
    };

    jest.spyOn(service, 'deleteRoleByValue').mockResolvedValue(mockRole);

    const deletedRole = await controller.deleteRoleByValue(
      deleteRoleData.value,
    );
    expect(service.deleteRoleByValue).toHaveBeenCalledWith(
      deleteRoleData.value,
    );

    expect(deletedRole).toEqual(mockRole);
  });
});

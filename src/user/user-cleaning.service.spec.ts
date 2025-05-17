import { TestingModule, Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { UserCleaningService } from './user-cleaning.service';

describe('UserCleaningService', () => {
  let service: UserCleaningService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCleaningService,
        {
          provide: UserRepository,
          useValue: {
            deleteUnverifiedUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserCleaningService>(UserCleaningService);
    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('Should delete unverified users', async () => {
    const result = { count: 1 };
    jest.spyOn(repository, 'deleteUnverifiedUsers').mockResolvedValue(result);

    await service.deleteUnverifiedUsers();
    expect(repository.deleteUnverifiedUsers).toHaveBeenCalled();
  });
});

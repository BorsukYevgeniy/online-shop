import { PrismaService } from '../prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { ChatMemberValidationRepository } from './chat-member-validation.repository';

describe('ChatRepository', () => {
  let repository: ChatMemberValidationRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChatMemberValidationRepository,
        {
          provide: PrismaService,
          useValue: {
            chat: {
              findUnique: jest.fn(),
              delete: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<ChatMemberValidationRepository>(
      ChatMemberValidationRepository,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('Should get users in chat', async () => {
    const mockUsers = { users: [{ id: 1 }, { id: 2 }] };
    jest.spyOn(prisma.chat, 'findUnique').mockResolvedValue(mockUsers as any);

    const result = await repository.getUsersInChat(1);
    expect(result).toEqual(mockUsers);
  });
});

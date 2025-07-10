import { PrismaService } from '../prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { ChatMemberValidationRepository } from './chat-member-validation.repository';
import { ChatMemberValidationService } from './chat-member-validation.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ChatRepository', () => {
  let repository: ChatMemberValidationRepository;
  let service: ChatMemberValidationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChatMemberValidationService,
        {
          provide: ChatMemberValidationRepository,
          useValue: {
            getUsersInChat: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<ChatMemberValidationRepository>(
      ChatMemberValidationRepository,
    );
    service = module.get<ChatMemberValidationService>(
      ChatMemberValidationService,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('Should validate users', () => {
    const mockUsers = { users: [{ id: 1 }, { id: 2 }] };
    it.each<[string, boolean, boolean]>([
      ['Should get users in chat', true, true],
      ['Should not own user', true, false],
      ['Should not found user', false, false],
    ])('%s', async (_, found, own) => {
      if (found && own) {
        jest.spyOn(repository, 'getUsersInChat').mockResolvedValue(mockUsers);

        const result = await service.validateChatMembers(1, 1);

        expect(result).toBeUndefined();
      } else if (found && !own) {
        jest.spyOn(repository, 'getUsersInChat').mockResolvedValue(mockUsers);

        await expect(service.validateChatMembers(1, 3)).rejects.toThrow(
          ForbiddenException,
        );
      } else {
        jest.spyOn(repository, 'getUsersInChat').mockResolvedValue(undefined);

        await expect(service.validateChatMembers(1, 3)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });
});

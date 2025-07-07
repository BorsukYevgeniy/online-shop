import { Test, TestingModule } from '@nestjs/testing';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('MessageService', () => {
  let service: MessageService;
  let repository: MessageRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: MessageRepository,
          useValue: {
            createMessage: jest.fn(),
            getMessageById: jest.fn(),
            getMessagesByChatId: jest.fn(),
            updateMessage: jest.fn(),
            deleteMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    repository = module.get<MessageRepository>(MessageRepository);
  });

  it('Should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('Should create a message', async () => {
    const mockMessage = {
      id: 1,
      text: 'Hello',
      chatId: 1,
      userId: 1,
      user: { nickname: 'User1' },
    };

    jest.spyOn(repository, 'createMessage').mockResolvedValue(mockMessage);

    const result = await service.createMessage(
      { text: mockMessage.text },
      mockMessage.chatId,
      mockMessage.userId,
    );

    expect(result).toEqual(mockMessage);
  });

  describe('Should get message by id', () => {
    const mockMessage = {
      id: 1,
      text: 'Hello',
      chatId: 1,
      userId: 1,
      user: { nickname: 'User1' },
    };

    it.each<[string, number, boolean, boolean]>([
      ['Should get message by id', 1, true, true],
      ['Should not found message by id', 2, false, false],
      ['Should not found message by id', 2, true, false],
    ])('%s', async (_, id, found, owned) => {
      if (found && owned) {
        // Simulate a scenario where the message is found and owned by the user
        jest.spyOn(repository, 'getMessageById').mockResolvedValue(mockMessage);

        const result = await service.getMessageById(id, 1);
        expect(result).toEqual(mockMessage);
      } else if (found && !owned) {
        // Simulate a scenario where the user does not own the message

        jest.spyOn(repository, 'getMessageById').mockResolvedValue(mockMessage);

        await expect(service.getMessageById(id, 2)).rejects.toThrow(
          ForbiddenException,
        );
      } else {
        // Simulate a scenario where the message is not found
        jest.spyOn(repository, 'getMessageById').mockResolvedValue(null);

        await expect(service.getMessageById(id, 1)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });

  it('Should get messages by chat id', async () => {
    const mockMessages = [
      {
        id: 1,
        text: 'Hello',
        chatId: 1,
        userId: 1,
        user: { nickname: 'User1' },
      },
      { id: 2, text: 'Hi', chatId: 1, userId: 2, user: { nickname: 'User2' } },
    ];

    jest
      .spyOn(repository, 'getMessagesByChatId')
      .mockResolvedValue(mockMessages);

    const result = await service.getMessagesByChatId(1);

    expect(result).toEqual(mockMessages);
  });

  describe('Should update message', () => {
    const mockMessage = {
      id: 1,
      text: 'Hello',
      chatId: 1,
      userId: 1,
      user: { nickname: 'User1' },
    };

    it.each<[string, number, boolean, boolean]>([
      ['Should update message', 1, true, true],
      ['Should not update message if not owned', 1, true, false],
      ['Should not update message if not found', 2, false, false],
    ])('%s', async (_, id, found, owned) => {
      if (found && owned) {
        // Simulate a scenario where the message is found and owned by the user

        jest.spyOn(repository, 'getMessageById').mockResolvedValue(mockMessage);
        jest.spyOn(repository, 'updateMessage').mockResolvedValue(mockMessage);

        const result = await service.updateMessage(id, 1, { text: 'Updated' });

        expect(result).toEqual(mockMessage);
      } else if (found && !owned) {
        // Simulate a scenario where the user does not own the message

        jest.spyOn(repository, 'getMessageById').mockResolvedValue(mockMessage);

        await expect(
          service.updateMessage(id, 2, { text: 'Updated' }),
        ).rejects.toThrow(ForbiddenException);
      } else {
        // Simulate a scenario where the message is not found

        jest.spyOn(repository, 'getMessageById').mockResolvedValue(null);

        await expect(
          service.updateMessage(id, 1, { text: 'Updated' }),
        ).rejects.toThrow(NotFoundException);
      }
    });
  });

  describe('Should delete message', () => {
    const mockMessage = {
      id: 1,
      text: 'Hello',
      chatId: 1,
      userId: 1,
    };
    it.each<[string, number, boolean, boolean]>([
      ['Should delete message', 1, true, true],
      ['Should not delete message if not owned', 1, true, false],
      ['Should not delete message if not found', 2, false, false],
    ])('%s', async (_, id, found, owned) => {
      if (found && owned) {
        // Simulate a scenario where the message is found and owned by the user

        jest.spyOn(repository, 'getMessageById').mockResolvedValue(mockMessage);
        jest.spyOn(repository, 'deleteMessage').mockResolvedValue(mockMessage);

        const result = await service.deleteMessage(id, 1);

        expect(result).toEqual(mockMessage);
      } else if (found && !owned) {
        // Simulate a scenario where the user does not own the message

        jest.spyOn(repository, 'getMessageById').mockResolvedValue(mockMessage);

        await expect(service.deleteMessage(id, 2)).rejects.toThrow(
          ForbiddenException,
        );
      } else {
        // Simulate a scenario where the message is not found

        jest.spyOn(repository, 'getMessageById').mockResolvedValue(null);

        await expect(service.deleteMessage(id, 1)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });
});

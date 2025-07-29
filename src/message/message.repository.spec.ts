import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { MessageRepository } from './message.repository';

describe('MessageRepository', () => {
  let prisma: PrismaService;
  let repository: MessageRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageRepository,
        {
          provide: PrismaService,
          useValue: {
            message: {
              count: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<MessageRepository>(MessageRepository);
  });

  it('Should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('Should count messages in chat', async () => {
    const mockCount = 10;

    jest.spyOn(prisma.message, 'count').mockResolvedValue(mockCount);

    const result = await repository.countMessagesInChat(1);
    expect(result).toEqual(mockCount);
  });

  it('Should create a message', async () => {
    const mockMessage = {
      id: 1,
      text: 'Hello',
      chatId: 1,
      userId: 1,
      createdAt: new Date(),
      user: { nickname: 'User1' },
    };

    jest.spyOn(prisma.message, 'create').mockResolvedValue(mockMessage);

    const result = await repository.createMessage(
      { text: mockMessage.text },
      mockMessage.chatId,
      mockMessage.userId,
    );

    expect(result).toEqual(mockMessage);
    expect(prisma.message.create).toHaveBeenCalledWith({
      data: {
        text: mockMessage.text,
        chatId: mockMessage.chatId,
        userId: mockMessage.userId,
      },
      include: {
        user: { select: { nickname: true } },
      },
    });
  });

  it('Should get a message by ID', async () => {
    const mockMessage = { id: 1, text: 'Hello', chatId: 1, userId: 1, createdAt: new Date() };

    jest.spyOn(prisma.message, 'findUnique').mockResolvedValue(mockMessage);

    const result = await repository.getMessageById(mockMessage.id);

    expect(result).toEqual(mockMessage);
    expect(prisma.message.findUnique).toHaveBeenCalledWith({
      where: { id: mockMessage.id },
    });
  });

  it('Should get messages by chat ID', async () => {
    const mockMessages = [
      {
        id: 1,
        text: 'Hello',
        chatId: 1,
        userId: 1,createdAt: new Date(),

        user: { nickname: 'User1' },
      },
      { id: 2, text: 'Hi', chatId: 1, userId: 2, createdAt: new Date(),user: { nickname: 'User2' } },
    ];

    jest.spyOn(prisma.message, 'findMany').mockResolvedValue(mockMessages);

    const result = await repository.getMessagesByChatId(1, 0, 10);

    expect(result).toEqual(mockMessages);
    expect(prisma.message.findMany).toHaveBeenCalledWith({
      where: { chatId: 1 },
      include: {
        user: { select: { nickname: true } },
      },
      skip: 0,
      take: 10,
    });
  });

  it('Should update a message', async () => {
    const mockMessage = {
      id: 1,
      text: 'Updated message',
      chatId: 1,
      userId: 1,createdAt: new Date(),
      user: { nickname: 'User1' },
    };

    jest.spyOn(prisma.message, 'update').mockResolvedValue(mockMessage);

    const result = await repository.updateMessage(mockMessage.id, {
      text: mockMessage.text,
    });

    expect(result).toEqual(mockMessage);
    expect(prisma.message.update).toHaveBeenCalledWith({
      where: { id: mockMessage.id },
      data: { text: mockMessage.text },
      include: {
        user: { select: { nickname: true } },
      },
    });
  });

  it('Should delete a message', async () => {
    const mockMessage = { id: 1, text: 'Hello', chatId: 1, userId: 1,createdAt: new Date() };

    jest.spyOn(prisma.message, 'delete').mockResolvedValue(mockMessage);

    const result = await repository.deleteMessage(mockMessage.id);

    expect(result).toEqual(mockMessage);
    expect(prisma.message.delete).toHaveBeenCalledWith({
      where: { id: mockMessage.id },
    });
  });
});

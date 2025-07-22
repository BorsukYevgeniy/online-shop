import { PrismaService } from '../prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { ChatRepository } from './chat.repository';
import { ChatMessages } from './types/chat.types';

describe('ChatRepository', () => {
  let repository: ChatRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChatRepository,
        {
          provide: PrismaService,
          useValue: {
            chat: {
              findUnique: jest.fn(),
              delete: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              countMessagesInChat: jest.fn()
            },message: {
              count: jest.fn()
            }
          },
        },
      ],
    }).compile();

    repository = module.get<ChatRepository>(ChatRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(repository).toBeDefined();
  });

  it('Should find chat between users', async () => {
    const mockChat = { id: 1 };
    jest.spyOn(prisma.chat, 'findFirst').mockResolvedValue(mockChat as any);

    const result = await repository.findChatBetweenUsers(1, 2);
    expect(result).toEqual(mockChat);
  });

  it('Should get user chats', async () => {
    const mockChats = [
      {
        id: 1,
        users: [
          { id: 1, nickname: 'User1' },
          { id: 2, nickname: 'User2' },
        ],
      },
      {
        id: 2,
        users: [
          { id: 3, nickname: 'User3' },
          { id: 4, nickname: 'User4' },
        ],
      },
    ];
    jest.spyOn(prisma.chat, 'findMany').mockResolvedValue(mockChats as any);

    const result = await repository.getUserChats(1);

    expect(result).toEqual([
      { id: 1, withWhom: 'User2' },
      { id: 2, withWhom: 'User3' },
    ]);
  });

  it('Should count messages in chat', async () => {
    const mockCount=10

    jest.spyOn(prisma.message, 'count').mockResolvedValue(mockCount);

    const result = await repository.countMessagesInChat(1);
    expect(result).toEqual(mockCount);
  });

  it('Should get chat by id', async () => {
    const mockChat: ChatMessages = {
      id: 1,
      messages: [
        {
          id: 1,
          text: 'Hello',
          userId: 1,
          chatId: 1,
          user: { nickname: 'User1' },
        },
      ],
    };

    jest.spyOn(prisma.chat, 'findUnique').mockResolvedValue(mockChat as any);

    const result = await repository.getChatById(1,0,10);
    expect(result).toEqual(mockChat);
  });

  it('Should create chat', async () => {
    const mockChat = { id: 1 };
    jest.spyOn(prisma.chat, 'create').mockResolvedValue(mockChat as any);

    const result = await repository.createChat({ sellerId: 1, buyerId: 2 });
    expect(result).toEqual(mockChat);
  });

  it('Should delete chat', async () => {
    const mockChat = { id: 1 };
    jest.spyOn(prisma.chat, 'delete').mockResolvedValue(mockChat as any);

    const result = await repository.deleteChat(1);
    expect(result).toEqual(undefined);
  });
});

import { Test } from '@nestjs/testing';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';
import { Chat } from '@prisma/client';
import { ChatMessages, UserChat } from './types/chat.types';
import { NotFoundException } from '@nestjs/common';
import { MessageNickname } from '../message/types/message.type';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('ChatService', () => {
  let repository: ChatRepository;
  let service: ChatService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: ChatRepository,
          useValue: {
            getUsersInChat: jest.fn(),
            findChatBetweenUsers: jest.fn(),
            getUserChats: jest.fn(),
            getChatById: jest.fn(),
            createChat: jest.fn(),
            deleteChat: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<ChatRepository>(ChatRepository);
    service = module.get<ChatService>(ChatService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('Should find chat between users', () => {
    it.each<[string, Chat | null]>([
      ['Should find chat between users', { id: 1 }],
      ['Should not find chat between users', null],
    ])('%s', async (_, chat) => {
      jest.spyOn(repository, 'findChatBetweenUsers').mockResolvedValue(chat);
      const result = await service.findChatBetweenUsers(1, 2);
      expect(result).toEqual(chat);
    });
  });

  it("Should get user's chats", async () => {
    const userChats: UserChat[] = [
      { id: 1, withWhom: 'user2' },
      { id: 2, withWhom: 'user1' },
    ];
    jest.spyOn(repository, 'getUserChats').mockResolvedValue(userChats);
    const result = await service.getUserChats(1);
    expect(result).toEqual(userChats);
  });

  describe('Sould get chat by id', () => {
    it.each<[string, ChatMessages | null]>([
      [
        'Should get chat by id',
        { id: 1, messages: [{ userId: 1 }] as MessageNickname[] },
      ],
      ['Should not get chat by id', null],
    ])('%s', async (_, chat) => {
      jest.spyOn(repository, 'getChatById').mockResolvedValue(chat);
      if (chat) {
        jest
          .spyOn(repository, 'getUsersInChat')
          .mockResolvedValue({ users: [{ id: 1 }, { id: 2 }] });

        const result = await service.getChatById(1, 2);
        expect(result).toEqual(chat);
      } else {
        await expect(service.getChatById(1, 2)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });

  describe('Should create chat', () => {
    it.each<[string, boolean]>([
      ['Should create chat', true],
      ['Should not create chat', false],
    ])('%s', async (_, succes) => {
      if (succes) {
        jest
          .spyOn(repository, 'createChat')
          .mockResolvedValue({ id: 1 } as Chat);
        const result = await service.createChat({ sellerId: 1, buyerId: 2 });
        expect(result).toEqual({ id: 1 });
      } else {
        jest.spyOn(repository, 'createChat').mockRejectedValue(
          new PrismaClientKnownRequestError('', {
            clientVersion: '',
            code: '',
          }),
        );
        await expect(
          service.createChat({ sellerId: 1, buyerId: 2 }),
        ).rejects.toThrow(NotFoundException);
      }
    });
  });

  describe('Should delete chat', () => {
    it.each<[string, boolean]>([
      ['Should delete chat', true],
      ['Should not delete chat', false],
    ])('%s', async (_, success) => {
      if (success) {
        jest
          .spyOn(repository, 'getUsersInChat')
          .mockResolvedValue({ users: [{ id: 1 }, { id: 2 }] });
        jest.spyOn(repository, 'deleteChat').mockResolvedValue({ id: 1 });

        const result = await service.deleteChat(1, 1);
        expect(result).toEqual({ id: 1 });
      } else {
        jest.spyOn(repository, 'deleteChat').mockRejectedValue(
          new PrismaClientKnownRequestError('', {
            clientVersion: '',
            code: '',
          }),
        );

        await expect(service.deleteChat(1, 1)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });
});

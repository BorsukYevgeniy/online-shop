import { Test } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatApiController } from './chat.api.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { TokenService } from '../token/token.service';
import { AuthRequest } from '../types/request.type';
import { ChatMessages } from './types/chat.types';
import { NotFoundException } from '@nestjs/common';

describe('ChatApiController', () => {
  let controller: ChatApiController;
  let service: ChatService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      controllers: [ChatApiController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            getUsersInChat: jest.fn(),
            findChatBetweenUsers: jest.fn(),
            getUserChats: jest.fn(),
            getChatById: jest.fn(),
            createChat: jest.fn(),
            deleteChat: jest.fn(),
          },
        },
        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ChatApiController>(ChatApiController);
    service = module.get<ChatService>(ChatService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('Should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('Should get users chats', async () => {
    const userChats = [
      { id: 1, withWhom: 'user2' },
      { id: 2, withWhom: 'user1' },
    ];
    jest.spyOn(service, 'getUserChats').mockResolvedValue(userChats);
    const result = await controller.getMyChats({
      user: { id: 1 },
    } as AuthRequest);
    expect(result).toEqual(userChats);
  });

  describe('Should get chat by id', () => {
    it.each<[string, ChatMessages | null]>([
      ['Should get chat by id', { id: 1, messages: [] }],
      ['Should not get chat by id', null],
    ])('%s', async (_, chat) => {
      jest.spyOn(service, 'getChatById').mockResolvedValue(chat);
      const result = await controller.getСhatById(1, {
        user: { id: 1 },
      } as AuthRequest);

      expect(result).toEqual(chat);
    });
  });

  describe('Should create chat', () => {
    const createDto = { buyerId: 1, sellerId: 2 };
    it.each<[string, boolean]>([
      ['Should create chat', true],
      ['Should not create chat', false],
    ])('%s', async (_, succes) => {
      if (succes) {
        jest.spyOn(service, 'createChat').mockResolvedValue({ id: 1 });

        const result = await controller.createChat(createDto);
        expect(result).toEqual({ id: 1 });
      } else {
        jest
          .spyOn(service, 'createChat')
          .mockRejectedValue(new NotFoundException());

        await expect(controller.createChat(createDto)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });

  describe('Should delete chat', () => {
    it.each<[string, boolean]>([
      ['Should delete chat', true],
      ['Should not delete chat', false],
    ])('%s', async (_, success) => {
      if (success) {
        jest.spyOn(service, 'deleteChat').mockResolvedValue({ id: 1 });

        const result = await controller.deleteChat(
          { user: { id: 1 } } as AuthRequest,
          1,
        );
        expect(result).toEqual({ id: 1 });
      } else {
        jest
          .spyOn(service, 'deleteChat')
          .mockRejectedValue(new NotFoundException());

        await expect(
          controller.deleteChat({ user: { id: 1 } } as AuthRequest, 1),
        ).rejects.toThrow(NotFoundException);
      }
    });
  });
});

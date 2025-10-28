import { Test } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatApiController } from './chat.api.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { TokenService } from '../token/token.service';
import { ChatMessages } from './types/chat.types';
import { NotFoundException } from '@nestjs/common';
import { Role } from '../../common/enum/role.enum';

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
      { id: 1, withWhom: 'user2', createdAt: new Date() },
      { id: 2, withWhom: 'user1', createdAt: new Date() },
    ];

    jest.spyOn(service, 'getUserChats').mockResolvedValue({
      chats: userChats,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });

    const result = await controller.getMyChats(
      { id: 1, role: Role.USER, isVerified: true },
      { page: 1, pageSize: 10 },
    );
    expect(result).toEqual({
      chats: userChats,
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      prevPage: null,
      nextPage: null,
    });
  });

  describe('Should get chat by id', () => {
    it.each<[string, ChatMessages | null]>([
      ['Should get chat by id', { id: 1, messages: [], createdAt: new Date() }],
      ['Should not get chat by id', null],
    ])('%s', async (_, chat) => {
      jest.spyOn(service, 'getChatById').mockResolvedValue({
        chat,
        nextPage: null,
        page: 1,
        pageSize: 10,
        prevPage: null,
        total: 10,
        totalPages: 1,
      });

      const result = await controller.getСhatById(
        1,
        { page: 1, pageSize: 10 },
        { id: 1, role: Role.USER, isVerified: true },
      );

      expect(result).toEqual({
        chat,
        nextPage: null,
        page: 1,
        pageSize: 10,
        prevPage: null,
        total: 10,
        totalPages: 1,
      });
    });
  });

  describe('Should create chat', () => {
    const createDto = { buyerId: 1, sellerId: 2 };
    it.each<[string, boolean]>([
      ['Should create chat', true],
      ['Should not create chat', false],
    ])('%s', async (_, succes) => {
      if (succes) {
        jest
          .spyOn(service, 'createChat')
          .mockResolvedValue({ id: 1, createdAt: new Date() });

        const result = await controller.createChat(createDto);
        expect(result).toEqual({ id: 1, createdAt: expect.any(Date) });
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
        jest.spyOn(service, 'deleteChat').mockResolvedValue(undefined);

        const result = await controller.deleteChat(
          { id: 1, role: Role.USER, isVerified: true },
          1,
        );
        expect(result).toEqual(undefined);
      } else {
        jest
          .spyOn(service, 'deleteChat')
          .mockRejectedValue(new NotFoundException());

        await expect(
          controller.deleteChat({ id: 1, role: Role.USER, isVerified: true }, 1),
        ).rejects.toThrow(NotFoundException);
      }
    });
  });
});

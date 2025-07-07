import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { AuthRequest } from '../types/request.type';
import { TokenService } from '../token/token.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ChatMessageApiController } from './chat-message.api.controller';

const req = { user: { id: 1 } } as AuthRequest;

describe('ChatMessageApiController', () => {
  let controller: ChatMessageApiController;
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ChatMessageApiController],
      providers: [
        {
          provide: MessageService,
          useValue: {
            getMessagesByChatId: jest.fn(),
            createMessage: jest.fn(),
          },
        },
        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ChatMessageApiController>(ChatMessageApiController);
    service = module.get<MessageService>(MessageService);
  });

  it('Should be defined', async () => {
    expect(controller).toBeDefined();
  });

  it('Should get messages by chat id', async () => {
    const chatId = 1;
    const messages = [
      {
        id: 1,
        text: 'text',
        userId: 1,
        chatId: 1,
        user: { nickname: 'User1' },
      },
    ];

    jest.spyOn(service, 'getMessagesByChatId').mockResolvedValue(messages);

    const result = await controller.getMessagesByChatId(chatId);
    expect(result).toEqual(messages);
  });

  it('Should create a message', async () => {
    const createDto = { text: 'Hello' };
    const message = {
      id: 1,
      text: 'Hello',
      chatId: 1,
      userId: 1,
      user: { nickname: 'User1' },
    };

    jest.spyOn(service, 'createMessage').mockResolvedValue(message);

    const result = await controller.createMessage(
      req,
      message.chatId,
      createDto,
    );
    expect(result).toEqual(message);
  });
});

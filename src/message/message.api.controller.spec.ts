import { Test, TestingModule } from '@nestjs/testing';
import { MessageApiController } from './message.api.controller';
import { MessageService } from './message.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { AuthRequest } from '../types/request.type';
import { TokenService } from '../token/token.service';
import { CacheModule } from '@nestjs/cache-manager';

const req = { user: { id: 1 } } as AuthRequest;

describe('MessageApiController', () => {
  let controller: MessageApiController;
  let service: MessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [MessageApiController],
      providers: [
        {
          provide: MessageService,
          useValue: {
            getMessageById: jest.fn(),
            updateMessage: jest.fn(),
            deleteMessage: jest.fn(),
          },
        },
        { provide: TokenService, useValue: { verifyAccessToken: jest.fn() } },
      ],
    }).compile();

    controller = module.get<MessageApiController>(MessageApiController);
    service = module.get<MessageService>(MessageService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Should get message by id', () => {
    const mockMessage = {
      id: 1,
      text: 'Hello',
      chatId: 1,
      userId: 1,
      createdAt: new Date(),
      user: { nickname: 'User1' },
    };

    it.each<[string, number, boolean, boolean]>([
      ['Should get message by id', 1, true, true],
      ['Should not own message by id', 2, true, false],
      ['Should not found message by id', 1, false, false],
    ])('%s', async (_, id, found, owned) => {
      if (found && owned) {
        // Simulate a scenario where the message is found and owned by the user
        jest.spyOn(service, 'getMessageById').mockResolvedValue(mockMessage);

        const result = await controller.getMessageById(id, req);
        expect(result).toEqual(mockMessage);
      } else if (found && !owned) {
        // Simulate a scenario where the user does not own the message

        jest
          .spyOn(service, 'getMessageById')
          .mockRejectedValue(new ForbiddenException());

        await expect(controller.getMessageById(id, req)).rejects.toThrow(
          ForbiddenException,
        );
      } else {
        // Simulate a scenario where the message is not found
        jest
          .spyOn(service, 'getMessageById')
          .mockRejectedValue(new NotFoundException());

        await expect(controller.getMessageById(id, req)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });

  describe('Should update message', () => {
    const mockMessage = {
      id: 1,
      text: 'Hello',
      chatId: 1,
      userId: 1,
      createdAt: new Date(),
      user: { nickname: 'User1' },
    };

    it.each<[string, number, boolean, boolean]>([
      ['Should update message', 1, true, true],
      ['Should not own message', 2, true, false],
      ['Should not found message', 3, false, false],
    ])('%s', async (_, id, found, owned) => {
      if (found && owned) {
        // Simulate a scenario where the message is found and owned by the user
        jest.spyOn(service, 'updateMessage').mockResolvedValue(mockMessage);

        const result = await controller.updateMessage(req, id, {
          text: 'Updated Text',
        });

        expect(result).toEqual(mockMessage);
      } else if (found && !owned) {
        // Simulate a scenario where the user does not own the message

        jest
          .spyOn(service, 'updateMessage')
          .mockRejectedValue(new ForbiddenException());

        await expect(
          controller.updateMessage(req, id, { text: 'Updated Text' }),
        ).rejects.toThrow(ForbiddenException);
      } else {
        // Simulate a scenario where the message is not found

        jest
          .spyOn(service, 'updateMessage')
          .mockRejectedValue(new NotFoundException());

        await expect(
          controller.updateMessage(req, id, { text: 'Updated Text' }),
        ).rejects.toThrow(NotFoundException);
      }
    });
  });

  describe('Should delete message', () => {
    it.each<[string, number, boolean, boolean]>([
      ['Should delete message', 1, true, true],
      ['Should not own message', 2, true, false],
      ['Should not found message', 3, false, false],
    ])('%s', async (_, id, found, owned) => {
      if (found && owned) {
        // Simulate a scenario where the message is found and owned by the user
        jest.spyOn(service, 'deleteMessage').mockResolvedValue({
          id: 1,
          text: 'Hello',
          chatId: 1,
          userId: 1,
          createdAt: new Date(),
        });

        const result = await controller.deleteMessage(req, id);
        expect(result).toEqual(undefined);
      } else if (found && !owned) {
        // Simulate a scenario where the user does not own the message

        jest
          .spyOn(service, 'deleteMessage')
          .mockRejectedValue(new ForbiddenException());

        await expect(controller.deleteMessage(req, id)).rejects.toThrow(
          ForbiddenException,
        );
      } else {
        // Simulate a scenario where the message is not found

        jest
          .spyOn(service, 'deleteMessage')
          .mockRejectedValue(new NotFoundException());

        await expect(controller.deleteMessage(req, id)).rejects.toThrow(
          NotFoundException,
        );
      }
    });
  });
});

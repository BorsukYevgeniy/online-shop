import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
import { TokenService } from '../token/token.service';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { SendMessageDto } from 'src/message/dto/send-message.dto';
import { SsrExceptionFilter } from 'src/filter/ssr-exception.filter';
import { UpdateMessageGatewayDto } from 'src/message/dto/update-message-gateway.dto';
import { DeleteMessageGatewayDto } from 'src/message/dto/delete-message-gatewat.dto';
import { TokenPayload } from 'src/token/interface/token.interfaces';

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
@UsePipes(
  new ValidationPipe({
    transform: true,
    exceptionFactory: (errs) => {
      errs.forEach((err) => {
        throw new WsException({
          errorCode: 400,
          message: Object.values(err.constraints)[0],
          chatId: err.target.chatId,
        });
      });
    },
  }),
)
@UseFilters(SsrExceptionFilter)
export class ChatGateway
  implements
    OnGatewayInit<Server>,
    OnGatewayConnection<Socket>,
    OnGatewayDisconnect<Socket>
{
  @WebSocketServer()
  server: Server;

  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(
    private readonly messageService: MessageService,
    private readonly tokenService: TokenService,
  ) {}

  async afterInit() {
    this.logger.debug(`WebSocket initialized on ws://localhost:${process.env.PORT}`);
  }

  async handleConnection(client: Socket) {
    this.logger.debug(`Client ${client.id} connected`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.debug(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Client ${client.id} is joining to chat ${chatId}`);

    client.join(`chat-${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() body: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.getUserFromWs(client);

    const message = await this.messageService.createMessage(
      { text: body.text },
      body.chatId,
      user.id,
    );

    this.logger.log(`User ${user.id} sent a message in chat ${body.chatId}`);

    this.server.to(`chat-${body.chatId}`).emit('chatMessage', message);
  }

  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @MessageBody() body: UpdateMessageGatewayDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.getUserFromWs(client);

    const message = await this.messageService.updateMesssage(
      body.messageId,
      user.id,
      {
        text: body.text,
      },
    );

    this.logger.log(`User ${user.id} updated a message in chat ${body.chatId}`);

    this.server.to(`chat-${body.chatId}`).emit('chatUpdateMessage', message);
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() body: DeleteMessageGatewayDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.getUserFromWs(client);

    const message = await this.messageService.deleteMessage(
      body.messageId,
      user.id,
    );

    this.logger.log(`User ${user.id} deleted a message in chat ${body.chatId}`);

    this.server.to(`chat-${body.chatId}`).emit('chatDeleteMessage', message);
  }

  private async getUserFromWs(client: Socket): Promise<TokenPayload> {
    const accessToken = client.handshake.headers.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('accessToken='))
      .split('=')[1];

    const payload = await this.tokenService.verifyAccessToken(accessToken);

    this.logger.log(
      `Extracted access token from client ${client.id} by user ${payload.id}`,
    );

    return payload;
  }
}

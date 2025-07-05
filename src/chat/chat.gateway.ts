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
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { SendMessageDto } from 'src/message/dto/send-message.dto';
import { SsrExceptionFilter } from 'src/filter/ssr-exception.filter';
import { UpdateMessageGatewayDto } from 'src/message/dto/update-message-gateway.dto';
import { DeleteMessageGatewayDto } from 'src/message/dto/delete-message-gatewat.dto';
import { TokenPayload } from 'src/token/interface/token.interfaces';

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
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly tokenService: TokenService,
  ) {}

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
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
    this.server.to(`chat-${body.chatId}`).emit('chatMessage', message);
  }

  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @MessageBody() body: UpdateMessageGatewayDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.getUserFromWs(client);

    const newMessage = await this.messageService.updateMesssage(
      body.messageId,
      user.id,
      {
        text: body.text,
      },
    );

    this.server.to(`chat-${body.chatId}`).emit('chatUpdateMessage', newMessage);
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() body: DeleteMessageGatewayDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.getUserFromWs(client)

    const message = await this.messageService.deleteMessage(body.messageId,user.id);

    this.server.to(`chat-${body.chatId}`).emit('chatDeleteMessage', message);
  }

  private async getUserFromWs(client: Socket): Promise<TokenPayload> {
    const accessToken = client.handshake.headers.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('accessToken='))
      .split('=')[1];

    return await this.tokenService.verifyAccessToken(accessToken);
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
import { CreateMessageDto } from '../message/dto/create-message.dto';
import { UpdateMessageDto } from '../message/dto/update-message.dto';
import { TokenService } from '../token/token.service';


@WebSocketGateway({ cors: true })
export class ChatGateway{
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
    @MessageBody() body: CreateMessageDto & {chatId: number},
    @ConnectedSocket() client: Socket,
  ) {

    const accessToken = client.handshake.headers.cookie
      .split('; ')[0]
      .split('=')[1];

    const {id: userId} = await this.tokenService.verifyAccessToken(accessToken)

    const message = await this.messageService.createMessage(
      { text: body.text },
      body.chatId,
      userId,
    );

    this.server.to(`chat-3`).emit('chatMessage', message);
  }

  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @MessageBody() body: { id: number; chatId: number } & UpdateMessageDto,
  ) {
    const newMessage = await this.messageService.updateMesssage(body.id, {
      text: body.text,
    });

    this.server.to(`chat-${body.chatId}`).emit('chatUpdateMessage', newMessage);
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() body: { id: number; chatId: number },
  ) {
    const message = await this.messageService.deleteMessage(body.id);

    this.server.to(`chat-${body.chatId}`).emit('chatDeleteMessage', message);
  }
}

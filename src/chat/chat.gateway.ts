import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { MessageService } from 'src/message/message.service';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { UpdateMessageDto } from 'src/message/dto/update-message.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService, private readonly messageService: MessageService) {}
  handleConnection(client: any, ...args: any[]) {}

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat-${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() body: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) { 
    const message = await this.messageService.createMessage(body);

    this.server.to(`chat-${body.chatId}`).emit('chatMessage', message);
  }

  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @MessageBody() body: { id: number; chatId: number } & UpdateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const newMessage = await this.messageService.updateMesssage(body.id, {
      text: body.text,
    });

    this.server.to(`chat-${body.chatId}`).emit('chatUpdateMessage', newMessage);
  }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() body: { id: number; chatId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messageService.deleteMessage(body.id);

    this.server.to(`chat-${body.chatId}`).emit('chatDeleteMessage', message);
  }
}

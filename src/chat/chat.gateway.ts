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
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway(+process.env.SOCKET_PORT,{ cors: true })
export class ChatGateway implements OnGatewayConnection{
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}
  handleConnection(client: any, ...args: any[]) {
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() chatId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat-${chatId}`);
    console.log(`Клієнт ${client.id} приєднався до кімнати chat-${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() body: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const newMessage = await this.chatService.createMessage(body);

    this.server.to(`chat-${body.chatId}`).emit('chatMessage', newMessage);
  }

}

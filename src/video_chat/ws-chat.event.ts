
  import { Injectable } from '@nestjs/common';
  import { InjectConnection, InjectModel } from '@nestjs/mongoose';
  import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
  } from '@nestjs/websockets';
  import * as mongoose from 'mongoose';
  import { Observable } from 'rxjs';
  import { Server, Socket } from 'socket.io';
import { CallRoom, CallRoomSchema } from '../models/call_room.model';
import { SocketUser, SocketWithUser } from '../redis/redis-io.adapter';
import { CallRoomChatService } from './chat.service';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
    namespace: '/chat'
  })
  export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {  
    constructor(@InjectConnection() private mongoConnection: mongoose.Connection) {}
    users: { user: SocketUser, room: string, socket: string }[] = [];
    handleConnection(client: SocketWithUser, ...args: any[]) {
      if(client.user) console.log(`${client?.user?.userName} Connected`);
    }
  
    handleDisconnect(client: SocketWithUser, ...args: any[]) {
      if(client.user) console.log(`${client.user.userName} Disconnected`);
      this.users = this.users.filter(e => e.socket != client.id);
      const disconectedUserRoom = this.users.find(e => e.socket == client.id)?.room;
      const roomUsers = this.users.filter(e => e.room == disconectedUserRoom);
      if(roomUsers.length > 1 && roomUsers.some(e => e.user.isAdmin)) {
        client.to(disconectedUserRoom).emit('admin-disconnected', { userName: client.user.userName, id: client.user.userId })
      }
    }
  
    @WebSocketServer()
    server: Server;
  
    @SubscribeMessage('join-room')
    async joinRoom(
      @MessageBody() room: string,
      @ConnectedSocket() client: SocketWithUser,
    ): Promise<Observable<WsResponse<number>>> {
      if(client.user) console.log(`${client.user.userName} Joined room: ${room} and his socket id is ${client.id}`);
      client.join(room);
      this.users.push({ user: client.user, room: room, socket: client.id });
      const roomUsers = this.users.filter(e => e.room == room)

      const db = this.mongoConnection.useDb('video-chat-poc');
      const liveBroadcastModel = db.model(CallRoom.name, CallRoomSchema);
      const chatService = new CallRoomChatService(liveBroadcastModel as any);
      const chats = await chatService.getChats(room);

      if(chats.length > 0) {
        client.emit('prev-chats', chats)
      }

      if(roomUsers.length > 1 && roomUsers.some(e => e.user.isAdmin)) {
        client.to(room).emit('admin-connected', { userName: client.user.userName, id: client.user.userId })
      }
      return;
    }
  
    @SubscribeMessage('message')
    async sendMessage(
      @MessageBody() data: { message: string, room: string },
      @ConnectedSocket() client: SocketWithUser,
    ): Promise<Observable<WsResponse<number>>> {
  
      const db = this.mongoConnection.useDb('video-chat-poc');
      const liveBroadcastModel = db.model(CallRoom.name, CallRoomSchema);
      const chatService = new CallRoomChatService(liveBroadcastModel as any);
      chatService.sendMessage(data.room, { sentBy: client.user.userId, userName: client.user.userName, text: data.message });
  
      client.to(data.room).except(client.id).emit(`newMessage`, { user: { userName: client.user.userName, id: client.user.userId }, message: data.message });
      return;
    }
  }
  
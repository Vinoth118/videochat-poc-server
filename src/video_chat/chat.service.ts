import {
  ChatMessage,
  CallRoom,
  CallRoomDocument,
} from 'src/models/call_room.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessageDto } from './dto/video_chat_dto';

@Injectable()
export class CallRoomChatService {
  constructor(
    @InjectModel(CallRoom.name)
    private callRoomModel: Model<CallRoomDocument>,
  ) {}

  async sendMessage(roomId: string, message: ChatMessageDto) {
    console.log('adding msg to the db')
    try {
      const result = await this.callRoomModel.findByIdAndUpdate(roomId, {
        $push: { chats: message },
      });
    } catch(e) {
      console.log('error whilie pushing chat into room row', e)
    }
  }

  async getChats(roomId: string) {
    try {
      const result = await this.callRoomModel.findById(roomId);
      return result.chats;
    } catch(e) {
      console.log('error whilie fetching chats', e)
    }
    return []
  }
}

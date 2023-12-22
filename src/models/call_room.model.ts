import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from './user.model';
import * as mongoose from 'mongoose';

export type CallRoomDocument = CallRoom & Document;

export interface ChatMessageType {
  sentBy: string,
  userName: string,
  text: string,
  createdAt: string
}

export interface CallRoomType {
  callType: 'chat' | 'video_chat';
  user: string;
  org: 'vinothh' | 'vijayy';
  chats: ChatMessageType[]
}

@Schema({ timestamps: false })
export class ChatMessage {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  })
  sentBy: mongoose.Schema.Types.ObjectId;

  @Prop()
  userName: string;

  @Prop()
  text: string;

  @Prop({ default: () => Date(), })
  createdAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

@Schema({ timestamps: true })
export class CallRoom extends Document {
  @Prop({ type: String, enum: ['chat', 'video_chat'], required: true })
  callType: 'chat' | 'video_chat';

  @Prop({ type: String, ref: User.name, required: true })
  user: mongoose.Schema.Types.ObjectId

  @Prop({ type: String, required: true, enum: ['vinothh', 'vijayy'] })
  org: 'vinothh' | 'vijayy'

  @Prop({ type: [ChatMessageSchema], default: [] })
  chats: ChatMessage[];

  updatedAt?: Date
}

export const CallRoomSchema = SchemaFactory.createForClass(CallRoom);
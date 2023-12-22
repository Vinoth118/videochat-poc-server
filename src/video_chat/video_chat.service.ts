import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import { Model } from 'mongoose';
import { SubDomain } from '../decorators';
import { CallRoom, CallRoomDocument } from '../models/call_room.model';
import { User, UserDocument } from '../models/user.model';
import { ChatRequestDto, VideoChatRequestDto } from './dto/video_chat_dto';

export interface VideoInitRequest {
  expireTime: any,
  channelName: string,
  userId: any;
}

@Injectable()
export class VideoChatService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(CallRoom.name) private callRoom: Model<CallRoomDocument>,
  ) {}

  async getRooms(subdomain: SubDomain) {
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    return this.callRoom.find({
      org: subdomain, updatedAt: { $gte: threeMinutesAgo } 
    }).populate('user')
  }

  async handleVideoCallReq(data: VideoChatRequestDto, org: SubDomain) {
    const room = await this.callRoom.findOne({ 
      user: data.userId, org: org
    }).populate('user');

    if(room != null) {
      room.callType = 'video_chat';
      room.updatedAt = new Date();
      await room.save();
      return room;
    }

    const createdRoom = await this.callRoom.create({
      user: data.userId,
      callType: 'video_chat',
      org: org,
      chats: []
    })
    
    return createdRoom.populate('user')
  }

  async handleChatReq(data: ChatRequestDto, org: SubDomain) {
    const room = await this.callRoom.findOne({ 
      user: data.userId, org: org
    }).populate('user');

    if(room != null) {
      room.callType = 'chat';
      room.updatedAt = new Date();
      await room.save();
      return room;
    }

    const createdRoom = await this.callRoom.create({
      user: data.userId,
      callType: 'chat',
      org: org,
      chats: []
    })
    
    return createdRoom.populate('user')
  }

  async getAdmins(org: string) {
    return this.userModel.find({ org: org, type: 'admin' });
  }

  async createRTCToken(payload: VideoInitRequest) {
    const appId = process.env.AGORA_APP_ID;
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId, 
      process.env.AGORA_APP_CERTIFICATE, 
      payload.channelName, 
      payload.userId, 
      RtcRole.PUBLISHER, 
      payload.expireTime
    );
    return {
      rtcToken: token,
      userId: payload.userId,
      appId: appId
    };
  }
}

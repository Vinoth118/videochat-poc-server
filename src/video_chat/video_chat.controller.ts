import { UserType } from './../models/user.model';
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VideoChatService } from './video_chat.service';
import { ChatRequestDto, VideoChatRequestDto } from './dto/video_chat_dto';
import { PlainBody, Subdomain, SubDomain } from '../decorators';
import { OneSignalService } from '../onesignal.service';
import * as moment from 'moment';

@Controller('video_chat')
export class VideoChatController {
  constructor(
    private readonly oneSignalService: OneSignalService,
    private readonly videoChatService: VideoChatService
  ) {}

  @Get('/rooms')
  async getRooms(@Subdomain() subdomain: SubDomain) {
    const result = await this.videoChatService.getRooms(subdomain);
    return {
      success: true, 
      data: result
    }
  }

  @Post('/')
  async handleVideoCallReq(@Subdomain() subdomain: SubDomain, @PlainBody() data: VideoChatRequestDto) {
    const result = await this.videoChatService.handleVideoCallReq(data, subdomain);
    const admins = await this.videoChatService.getAdmins(subdomain);
    await this.oneSignalService.notify({
      msgName: 'Call Requested',
      msg: `${(result.user as unknown as UserType).name} requested ${result.callType.replace('_', ' ')}`,
      to: admins.map(e => e._id.toString()),
      org: subdomain
    });
    return {
      success: true, 
      data: result,
    }
  }

  @Post('/chat')
  async handleChatReq(@Subdomain() subdomain: SubDomain, @PlainBody() data: ChatRequestDto) {
    const result = await this.videoChatService.handleChatReq(data, subdomain);
    const admins = await this.videoChatService.getAdmins(subdomain);
    await this.oneSignalService.notify({
      msgName: 'Call Requested',
      msg: `${(result.user as unknown as UserType).name} requested ${result.callType.replace('_', ' ')}`,
      to: admins.map(e => e._id.toString()),
      org: subdomain
    });
    return {
      success: true, 
      data: result,
    }
  }

  @Post('/token')
  async getRTCToken(@PlainBody() data: ChatRequestDto & { channelName: string }) {
    const expirationTimeInSeconds = 300 
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
    const result = await this.videoChatService.createRTCToken({
      channelName: data.channelName,
      userId: data.userId,
      expireTime: privilegeExpiredTs
    });
    return {
      success: true, 
      data: result,
    }
  }

}

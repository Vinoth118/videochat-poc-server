import { Module } from '@nestjs/common';
import { VideoChatService } from './video_chat.service';
import { VideoChatController } from './video_chat.controller';
import { EventsGateway } from './ws-chat.event';
import { MongooseModule } from '@nestjs/mongoose';
import { CallRoom, CallRoomSchema } from '../models/call_room.model';
import { User, UserSchema } from '../models/user.model';
import { OneSignalService } from 'src/onesignal.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CallRoom.name, schema: CallRoomSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [VideoChatController],
  providers: [VideoChatService, OneSignalService, EventsGateway]
})
export class VideoChatModule {}

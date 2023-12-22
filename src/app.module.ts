import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { ConfigModule } from '@nestjs/config'
import { EventsGateway } from './video_chat/ws-chat.event';
import { VideoChatModule } from './video_chat/video_chat.module';
import { OneSignalService } from './onesignal.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_DB_URL+'video-chat-poc'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    VideoChatModule
  ],
  controllers: [AppController],
  providers: [AppService, OneSignalService],
})
export class AppModule {}

import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import * as jwt from "jsonwebtoken";

export interface SocketUser  {
  userName: string,
  userId: string,
  isAdmin: boolean,
}

export interface SocketWithUser extends Socket {
  user: SocketUser,
  dbName?: string
}

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: `redis://${process.env.REDIS_LIVE_CHAT_PUBSUB_ADAPTER_HOST}:${process.env.REDIS_LIVE_CHAT_PUBSUB_ADAPTER_PORT}`,
      password: process.env.REDIS_LIVE_CHAT_PUBSUB_ADAPTER_PASSWORD
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    server.of('/chat').use(AuthenticateUserMiddleware());
    return server;
  }
}

const AuthenticateUserMiddleware = () => (socket: SocketWithUser, next) => {
  const userName = socket.handshake.headers.user_name as string;
  const userId = socket.handshake.headers.user_id as string;
  const isAdmin = (socket.handshake.headers.type as string) == 'admin';
  socket.user = { userName, userId, isAdmin }
  next();
}

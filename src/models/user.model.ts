import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export interface UserType {
    name: string;
    email: string;
    type: 'admin' | 'customer';
    org: 'vinothh' | 'vijayy';
    osId?: string;
    subscriptions?: { id: string, token: string, type: string }[];
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string

  @Prop({ type: String, enum: ['admin', 'customer'], required: true })
  type: 'admin' | 'customer'

  @Prop({ type: String, required: true, enum: ['vinothh', 'vijayy'] })
  org: 'vinothh' | 'vijayy'

  @Prop({ type: String, required: false, default: '' })
  osId?: string

  subscriptions?: { id: string, token: string, type: string }[]
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1, org: 1, type: 1 }, { unique: true });
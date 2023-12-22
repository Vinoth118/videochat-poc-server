import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UserDocument, User, UserType } from './models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { OneSignalService } from './onesignal.service';

@Injectable()
export class AppService {
  constructor(
    private readonly oneSignalService: OneSignalService,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async getUsers() {
    return this.userModel.find();
  }
  
  async getUser(query: { [x: string]: string }) {
    return this.userModel.findOne(query);
  }

  async registerUser(data: UserType) {
    const createdUser = await this.userModel.create(data);
    const createdUserInOneSignal = await this.oneSignalService.createOnesignalUser(createdUser);
    if(createdUserInOneSignal) {
      createdUser.osId = createdUserInOneSignal.identity.onesignal_id;
    }
    const updatedUser = await createdUser.save();
    const orgDetails = this.oneSignalService.organisationDetails.find(e => e.name == data.org);

    return { user: updatedUser, oneSignalAppId: orgDetails.onesignalAppId }
  }

  async loginUser(email: string, type: 'admin' | 'customer', org: string) {
    const foundUser = await this.getUser({ email: email, type: type, org: org });
    if(foundUser == null) return null;

    const orgDetails = this.oneSignalService.organisationDetails.find(e => e.name == org);
    return { user: foundUser, oneSignalAppId: orgDetails.onesignalAppId };
  }

}


import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UserDocument, User, UserType } from './models/user.model';
import { InjectModel } from '@nestjs/mongoose';


export interface NotificationPayload { 
  msgName: string,
  msg: string,
  to: string[],
  org: 'vinothh' | 'vijayy'
}

@Injectable()
export class OneSignalService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  organisationDetails = [
    {
      name: 'vinothh',
      id: 'vinothh.trendytreasures.nl',
      onesignalAppId: 'f1d85bd3-8bf5-4866-a660-d9a716351907',
      restApiKey: 'MWVmY2Y1N2MtYjk1NS00YWJhLWEyMzUtMWU4YjZmZTU0MTg4'
    },
    {
      name: 'vijayy',
      id: 'vijayy.trendytreasures.nl',
      onesignalAppId: '5c07872a-6df4-45e0-b9b9-b935091cdf75',
      restApiKey: 'OTllMTliNzAtN2RlMi00MTUxLTkwZWEtYWI1OTFhYjBkMmUx'
    }
  ];

  async notify(data: NotificationPayload) {
    const organisation = this.organisationDetails.find(e => e.name == data.org);
    const payload = {
      app_id: organisation.onesignalAppId,
      name: data.msgName,
      contents: { en: data.msg },
      include_aliases: { external_id: data.to },
      target_channel: 'push'
    }
    try {
      const response = await this.sendNotification(payload, organisation.restApiKey, organisation.id);
      return [response];
    } catch(e) {
      console.log('notification failed for one user: ', e)
    }
  }

  async sendNotification(payload: { [x: string]: any }, apiKey: string, org: string) {
    console.log('push notification payload', payload);
    try {
      const res = await axios.post(`https://onesignal.com/api/v1/notifications`, payload, {
        headers: {
          Authorization: `Basic ${apiKey}`
        }
      });
      if(res.data) {
        console.log(res.data)
        return { success: true, org: org, data: res.data };
      } else {
        return { success: false, org: org, data: null };;
      }
    } catch(e) {
      console.log(e);
      console.log('error data while sending notification: ', e.response.data)
      return { success: false, org: org, data: null };;
    }
  }

  async createOnesignalUser(user: UserDocument) {
    const { onesignalAppId, restApiKey, ...rest } = this.organisationDetails.find(e => e.name == user.org);
    const payload = { identity: { external_id: user._id } };
    console.log('create user payload: ', payload);
    try {
      const res = await axios.post(`https://onesignal.com/api/v1/apps/${onesignalAppId}/users`, payload);
      console.log('create user success: ', res.data)
      return res.data;
    } catch(e) {
      //console.log('error while creating user', e);
      console.log('error data while creating user', e.response.data);
    }
  }

}


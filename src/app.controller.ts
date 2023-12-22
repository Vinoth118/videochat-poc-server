import { Body, Controller, createParamDecorator, ExecutionContext, Get, Post, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { getSubdomain } from 'tldts';
import { AppService } from './app.service';
import { Subdomain, PlainBody, SubDomain } from './decorators';
import { UserType } from './models/user.model';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/users')
  async getUsers(@Subdomain() subdomain: SubDomain) {
    const result = await this.appService.getUsers();
    return {
      success: true,
      data: result
    }
  }

  @Post('/register')
  async registerUser(@Subdomain() subdomain: SubDomain, @PlainBody() data: UserType) {
    const registerUserData = { ...data, org: subdomain };
    try {
      const result = await this.appService.registerUser(registerUserData);
      return {
        success: result != null,
        data: result
      }
    } catch(e) {
      return {
        success: false,
        message: 'RECORD_EXIST'
      }
    }
  }

  @Post('/login')
  async loginUser(@Subdomain() subdomain: SubDomain, @PlainBody() data: { email: string, type: 'admin' | 'customer' }) {
    const result = await this.appService.loginUser(data.email, data.type, subdomain);
    return {
      success: result != null,
      data: result
    }
  }
}

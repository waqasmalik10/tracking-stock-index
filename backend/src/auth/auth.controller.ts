import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { CreateUserDto } from './dtos/create-user.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('user/:uid')
  async getUser(@Param('uid') uid: string) {
    return this.authService.getUser(uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Delete('user/:uid')
  async deleteUser(@Param('uid') uid: string) {
    await this.authService.deleteUser(uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('social-login')
  async SocialLogin(@Req() request: Request) {
    const user = request?.['user'] ?? {};
    const { email, uid } = user;
    await this.authService.socialLogin(email, uid);
  }
}

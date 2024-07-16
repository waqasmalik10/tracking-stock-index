import { Module } from '@nestjs/common';
import { IndicesService } from './indices.service';
import { IndicesController } from './indices.controller';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [HttpModule],
  providers: [
    IndicesService,
    FirebaseAuthGuard,
    ConfigService,
    AuthService,
    MailService,
  ],
  controllers: [IndicesController],
})
export class IndicesModule {}

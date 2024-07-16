import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FirebaseAdminConfigService } from './firebase-admin.config';
import { ConfigModule } from '@nestjs/config';
import { IndicesModule } from './indices/indices.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    AuthModule,
    IndicesModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseAdminConfigService],
})
export class AppModule {}

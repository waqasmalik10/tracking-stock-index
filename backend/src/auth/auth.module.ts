import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  providers: [AuthService, FirebaseAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}

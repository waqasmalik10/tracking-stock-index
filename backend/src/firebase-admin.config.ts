import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminConfigService {
  private defaultApp: admin.app.App;

  constructor(private configService: ConfigService) {
    if (!admin.apps.length) {
      this.defaultApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('PROJECTID'),
          clientEmail: this.configService.get<string>('CLIENTEMAIL'),
          privateKey: this.configService.get<string>('PRIVATEKEY'),
        }),
      });
    } else {
      this.defaultApp = admin.app();
    }
  }

  getApp(): admin.app.App {
    return this.defaultApp;
  }
}

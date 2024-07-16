import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as admin from 'firebase-admin';

import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class AuthService {
  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async createUser({
    email,
    password,
  }: CreateUserDto): Promise<admin.auth.UserRecord> {
    let user;
    try {
      user = await admin.auth().createUser({
        email,
        password,
      });
    } catch (err) {
      throw new UnprocessableEntityException(err.message);
    }

    await this.addUserToFirestore(user.uid, {
      email,
    });
    return user;
  }

  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    return await admin.auth().getUser(uid);
  }

  async deleteUser(uid: string): Promise<void> {
    await admin.auth().deleteUser(uid);
  }

  async addUserToFirestore(
    uid: string,
    data: Record<string, any>,
  ): Promise<void> {
    const db = admin.firestore();
    await db.collection('users').doc(uid).set(data);
  }

  async socialLogin(email: string, uid: string): Promise<void> {
    const db = admin.firestore();
    const userQuery = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (userQuery.empty) {
      const userRef = db.collection('users').doc(uid);
      await userRef.set({
        email: email,
      });
    }
  }
}

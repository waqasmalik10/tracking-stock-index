import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import * as admin from 'firebase-admin';
import { UpdateThoresholdDto } from './dtos/update-throeshold.dto';
import { MailService } from '../mail/mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class IndicesService {
  apiKey: string;
  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly mailService: MailService,
  ) {
    this.apiKey = this.configService.get<string>('POLYGON_API_KEY');
  }

  getIndexData = async (index_ticker: string, interval: [string, string]) => {
    const url = `https://api.polygon.io/v2/aggs/ticker/${index_ticker}/range/1/day/${interval[0]}/${interval[1]}?apiKey=${this.apiKey}`;

    const response: AxiosResponse = await lastValueFrom(
      this.httpService.get(url),
    );

    return response.data?.results || [];
  };

  getIndicesSnapshot = async () => {
    try {
      const indicesString = ['I:DJI', 'I:SPX', 'I:DJT', 'DJU', 'NDX'].join(',');
      const url = `https://api.polygon.io/v3/snapshot/indices?ticker.any_of=${indicesString}&apiKey=${this.apiKey}`;
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(url),
      );

      return response.data?.results || [];
    } catch (err) {
      console.log('Error is: ', err);
      return [];
    }
  };

  setThroeshold = async (
    uid: string,
    index: string,
    updateThresholdDto: UpdateThoresholdDto,
  ) => {
    const { threshold, direction, name } = updateThresholdDto;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);

    try {
      const doc = await userRef.get();
      if (!doc.exists) {
        throw new Error(`No document found for user with uid ${uid}`);
      }

      const data = doc.data();
      const currentThresholds = data?.thresholds || [];

      const updatedThresholds = [
        ...currentThresholds,
        { index, threshold, direction, name },
      ];

      await userRef.update({
        thresholds: updatedThresholds,
      });
    } catch (error) {
      throw new Error('Failed to update user');
    }
  };

  @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_12PM)
  async processThresholds(): Promise<void> {
    console.log(
      '============= Processing Thresholds =========================',
    );
    try {
      const indicesSnapShot = await this.getIndicesSnapshot();
      if (indicesSnapShot.length === 0) return;
      const indicesWithValues = indicesSnapShot.map(
        (ind: { value: number; ticker: string }) => ({
          closing: ind.value,
          index: ind.ticker,
        }),
      );

      const db = admin.firestore();
      const userDocs = (await db.collection('users').get()).docs;

      for (const userDoc of userDocs) {
        const userData = userDoc.data();
        const userEmail = userData.email;
        const thresholds = userData.thresholds || [];

        for (const { index, closing } of indicesWithValues) {
          const threshold = thresholds.find(
            (thresh: { index: string }) => thresh.index === index,
          );
          if (threshold) {
            let shouldRemove = false;
            if (threshold.direction === 'up' && closing > threshold.threshold) {
              shouldRemove = true;
            } else if (
              threshold.direction === 'down' &&
              closing < threshold.threshold
            ) {
              shouldRemove = true;
            }
            if (shouldRemove) {
              console.log(
                `User ${userEmail} has a threshold matching criteria for index ${index} and closing ${closing}`,
              );

              const updatedThresholds = thresholds.filter(
                (thresh: { index: string }) => thresh.index !== index,
              );
              await userDoc.ref.update({ thresholds: updatedThresholds });

              await this.mailService.send(userEmail, {
                index,
                threshold: threshold.threshold,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing thresholds', error);
      throw new Error('Failed to process thresholds');
    }
  }
}

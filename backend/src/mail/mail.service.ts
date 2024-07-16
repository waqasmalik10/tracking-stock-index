import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async send(to: string, data: { [key: string]: string | number }) {
    const templatePath = path.join(
      __dirname,
      '..',
      'templates',
      'threshold-exceeded.html',
    );

    console.log('templatePath: ', templatePath);
    let htmlTemplate;

    try {
      htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    } catch (err) {
      console.error('Error reading file:', err);
      return;
    }

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value =
          typeof data[key] === 'number' ? data[key].toString() : data[key];
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlTemplate = htmlTemplate.replace(regex, value);
      }
    }
    const msg: sgMail.MailDataRequired = {
      to,
      from: this.configService.get<string>('SENDER_ID'),
      subject: 'Threshold Crossed',
      html: htmlTemplate,
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      if (error.response) {
        console.error(error.response.body);
      }
      return { success: false, error: error.message };
    }
  }
}

import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as express from 'express';
import * as functions from 'firebase-functions';
import { AppModule } from './app.module';
import * as cors from 'cors';

const server: express.Express = express();

const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://stock-pricing-450e7.web.app' // Production
];

const corsOptions = {
  origin: (
    origin: string,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
};

// Add logging middleware
server.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Origin:', req.headers.origin);
  next();
});

server.use(cors(corsOptions));

server.options('*', cors(corsOptions));

const createNestServer = async (
  expressInstance: express.Express,
): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.enableCors(corsOptions);

  await app.init();
};

createNestServer(server)
  .then(() => console.log('Nest Ready'))
  .catch((err: Error) => console.error('Nest broken', err));

export const api = functions.https.onRequest((request, response) => {
  console.log('Function Invoked');
  server(request, response);
});

import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';

let server: Handler;

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const awsHandler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {

  console.log('Incoming event', event);
  
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
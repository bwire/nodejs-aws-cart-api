import 'source-map-support/register';
import { App, Stack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { 
  HttpApi, 
  CorsHttpMethod, 
  HttpMethod, 
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { config as envConfig } from 'dotenv';

envConfig();

class ServerStack extends Stack {
  constructor() {
    const MAIN_APP_PREFIX = "bw-aws-cart-api";
    
    super(
      new App(), 
      `${MAIN_APP_PREFIX}-stack`, {
        description: 'This stack includes resources needed to deploy aws-cart-api application',
      },  
    );

    const lambda = new NodejsFunction(
      this, 
      `${MAIN_APP_PREFIX}-express-server-lambda`, {
        entry: 'dist/main.js',
        runtime: Runtime.NODEJS_18_X,
        functionName: 'expressServerHandler',
        handler: 'awsHandler',
        environment: {
          PGHOST: process.env.PGHOST!,
          PGPORT: process.env.PGPORT!,
          PGDATABASE: process.env.PGDATABASE!,
          PGUSER: process.env.PGUSER!,
          PGPASSWORD: process.env.PGPASSWORD!
        }
      }
    );

    const api = new HttpApi(this, `${MAIN_APP_PREFIX}-carts-api`, {
      corsPreflight: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: [CorsHttpMethod.ANY],
      }
    });

    api.addRoutes({
      integration: new HttpLambdaIntegration(
        `${MAIN_APP_PREFIX}-http-integration`, 
        lambda
      ),
      path: '/{api+}',
      methods: [HttpMethod.ANY]
    });
  }
}

new ServerStack();

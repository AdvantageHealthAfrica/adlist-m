import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import * as session from 'express-session'

// const cookieSession = require('cookie-session');
import * as cookieParser from 'cookie-parser';
// import * as csurf from 'csurf';
import { nestCsrf, CsrfFilter } from "ncsrf";
import Helmet from 'helmet';



async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (process.env.NODE_ENV == 'production') {
    app.use(Helmet()); // wrapper function for some web security functions
  }

  // application should provide cookies
  app.use(cookieParser());

  // for csrf protection
  // app.use(csurf())
  app.use(nestCsrf());
  
  // enabling Cross-Site Request
  // app.enableCors({
  //   credentials: true, // credentials will be accessed
  // });

  app.enableCors({origin: ["http://localhost:3000", "http://127.0.0.1:3000", "https://stock-taking-tool-frontend.vercel.app", "https://adlist-frontend.vercel.app"]});

  // apps should use pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // removes unnecessary properties in POST request body
      transform: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('ADList')
    .setDescription('Stock-taking API for TheAdvantage.')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();

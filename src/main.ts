import { ValidationPipe } from './common/pipe/validation.pipe';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as requestIp from 'request-ip';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { json, urlencoded } from 'express';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import { INestApplication } from '@nestjs/common';
import { AppTypes, swaggerCreatorOption } from './common/services/interface/app.interface';
import { AdminAppModule } from './admin.app.module';

async function bootstrap() {
  // create an instance of Nest application by passing AppModule
  const app = await NestFactory.create(AppModule, {
    // initialize some configurations options
    logger: ['warn', 'log'],
    cors: true
  })

  // only use helmet middleware when process.env.local is false
  if (!process.env.local) app.use(helmet({ crossOriginResourcePolicy: false }));

  // apply global validation pipe, logging interceptor, body-parser and request IP middleware
  app
    .useGlobalInterceptors(new LoggingInterceptor())
    .setGlobalPrefix('api') // set prefix /api
    .useGlobalPipes(new ValidationPipe)
    .use(bodyParser.json({ limit: '50mb' }))
    .use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
    .use(requestIp.mw());

  // generate document using documentCreator function
  documentCreator({
    app,
    appType: AppTypes.user,
    title: `artaniom ${process.env.EXECUTION} api`,
    desc: 'The Artaniom Api Documents',
    version: '1.15.2',
    path: 'docs'
  });

  // start listening on configured port or default 3000
  await app.listen(process.env.PORT ?? 3000);

}

/**
 * This code defines an asynchronous function adminRunner that creates a 
 * NestJS application specifically for the admin module. Here is what each
 *  section does: 
 * The adminApp is created using the NestFactory's create() method, 
 * passing the AdminAppModule as the first parameter and an object 
 * with options as the second parameter. The options include logger, 
 * CORS, and others. 
 * If environment variable local does not exist, 
 * Helmet middleware is applied with crossOriginResourcePolicy set to false. 
 * Logging interceptor, a global prefix /admin, validation pipe, 
 * and body parsers for JSON and urlencoded data are registered. 
 * Finally, we set up the app to listen on a specific port (the ADMINPORT environment or 3003 if it doesn't exist).
 * It's worth noting that documentCreator() which generates our 
 * API documentation will only run if process.env.DEV evalutes to true. Additionally, 
 * the swagger/config options include security requirements; 
 * a security scheme requiring clients to provide an Authorization 
 * header flag is optionally included if the appType equals AppTypes.admin.
 */
async function adminRunner() {
  // ********************* admin application
  const adminApp = await NestFactory.create(AdminAppModule, {
    // bodyParser: false,
    logger: ['warn', 'log'],
    cors: true,
  });


  if (!process.env.local) adminApp.use(helmet({ crossOriginResourcePolicy: false }));

  adminApp
    .useGlobalInterceptors(new LoggingInterceptor())
    .setGlobalPrefix('admin')
    .useGlobalPipes(new ValidationPipe)
    .use(bodyParser.json({ limit: '50mb' }))
    .use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
    .use(requestIp.mw());

  documentCreator({
    app: adminApp,
    appType: AppTypes.admin,
    title: `admin ${process.env.EXECUTION} api`,
    desc: 'The Artaniom Admin Api Documents',
    version: '1.0.0',
    path: 'docs'
  });

  // app listen myPort
  await adminApp.listen(process.env.ADMINPORT ?? 3003);
}


/**
 * The function starts by creating a new
 * DocumentBuilder object with the provided 
 * title, desc, and version. It also adds security 
 * requirements for an API key named sign. If the
 * value of appType is "admin", it adds another 
 * security requirement for an API key named Authorization.
 * @param param0 
 */
function documentCreator({ app, appType, desc, title, version, path }: swaggerCreatorOption) {

  // swagger option
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(desc)
    .setVersion(version)
    .addSecurityRequirements('sign')
    .addSecurity('sign', {
      type: 'apiKey',
      in: 'header',
      name: 'sign',
    });

  if (appType == AppTypes.admin)
    config.addSecurity('Authorization', {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
    }).addSecurityRequirements('Authorization')

  if (process.env.DEV) {
    const document = SwaggerModule.createDocument(app, config.build());
    SwaggerModule.setup(path, app, document);
  }
}

bootstrap();
adminRunner();
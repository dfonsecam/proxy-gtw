import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OAuthMiddleware } from './middlewares/oauth.middleware';
import { ProxyMiddleware } from './middlewares/proxy.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.config'],
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      verifyOptions: {
        algorithms: ['HS256'],
      },
      signOptions: {
        algorithm: 'HS256',
      },
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OAuthMiddleware)
      .forRoutes('/api')
      .apply(ProxyMiddleware)
      .forRoutes({
        path: '(.*)',
        method: RequestMethod.ALL,
      });
  }
}

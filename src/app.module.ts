import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { ProxyMiddleware } from './middlewares/proxy.middleware';
import { ProxyService } from './services/proxy.service';

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
  providers: [ProxyService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('/api')
      .apply(ProxyMiddleware)
      .forRoutes('*');
  }
}

import {
  BadGatewayException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../services/proxy.service';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  constructor(
    private configService: ConfigService,
    private proxyService: ProxyService,
  ) {}

  use(req: any, res: any, next: () => void) {
    let target: string;
    if (req.originalUrl.includes('/oauth')) {
      target = this.configService.get('PROXY_TARGET0');
    } else if (req.originalUrl.includes('/users')) {
      target = this.configService.get('PROXY_TARGET1');
    } else if (req.originalUrl.includes('/clients')) {
      target = this.configService.get('PROXY_TARGET2');
    }
    if (!target) {
      throw new BadGatewayException('Service unavailable');
    }

    const proxy = this.proxyService.create({ target });
    proxy(req, res, next);
  }
}

import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestHandler } from 'express';
import { ProxyService } from '../services/proxy.service';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
    private proxy: RequestHandler;

    constructor(
        private configService: ConfigService,
        private proxyService: ProxyService,
    ) {
        this.proxy = this.proxyService.create({
            target: this.configService.get('PROXY_TARGET'),
        });
    }

    use(req: any, res: any, next: () => void) {
        this.proxy(req, res, next);
    }
}

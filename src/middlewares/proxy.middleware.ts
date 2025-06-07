import {
  BadGatewayException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as proxy from 'http-proxy-middleware';
import { ClientRequest, IncomingMessage } from 'node:http';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: any, res: any, next: () => void) {
    const routeTargetMap: { [key: string]: string } = {
      '/oauth': this.configService.get('PROXY_TARGET_OAUTH'),
      '/clients': this.configService.get('PROXY_TARGET_CLIENTS'),
      '/members': this.configService.get('PROXY_TARGET_MEMBERS'),
    };
    const foundRoute = Object.keys(routeTargetMap).find((route) =>
      req.originalUrl.startsWith(route),
    );
    const target = routeTargetMap?.[foundRoute];
    if (!target) {
      throw new BadGatewayException('Service unavailable');
    }
    const _proxy = proxy.createProxyMiddleware({
      target: target,
      changeOrigin: true,
      secure: false,
      on: {
        proxyReq: onProxyReq,
        proxyRes: onProxyRes,
      },
    });

    _proxy(req, res, next);
  }
}

function onProxyReq(proxyReq: ClientRequest, req: Request): void {
  proxyReq.setHeader('Accept-Encoding', 'UTF-8');
  if (req.body) {
    const data = JSON.stringify(req.body);
    proxyReq.setHeader('Content-Length', Buffer.byteLength(data));
  }
  console.log('Proxying from %s to %s', req.originalUrl, proxyReq.path);
}

function onProxyRes(
  proxyRes: IncomingMessage,
  req: Request,
  res: Response,
): void {
  console.log(`Proxyed  ${req.method} to '${req.originalUrl}'`);
  console.log('Headers sent: ', res.headersSent);
  console.log('Status:', proxyRes.statusCode);
}

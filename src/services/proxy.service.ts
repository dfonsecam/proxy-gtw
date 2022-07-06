import { Injectable, Optional } from '@nestjs/common';
import { Request, Response } from 'express';
import { ClientRequest, IncomingMessage } from 'http';
import * as proxy from 'http-proxy-middleware';

@Injectable()
export class ProxyService {
    private _proxy: proxy.RequestHandler;

    public get proxy(): proxy.RequestHandler {
        return this._proxy;
    }

    constructor(@Optional() target?: string) {
        if (!!target) {
            this._proxy = this.create({ target });
        }
    }

    public create(params: proxy.Options): proxy.RequestHandler {
        return proxy.createProxyMiddleware({
            secure: false,
            changeOrigin: true,
            onError,
            onProxyReq,
            onProxyRes,
            ...params,
        });
    }
}

export function onError(err: Error, req: Request, res: Response): void {
    console.error(
        `Proxy Error  ${req.method} to '${req.originalUrl}: ${err.message}'`,
    );
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Something went wrong. Internal Server Error.');
}

export function onProxyReq(proxyReq: ClientRequest, req: Request): void {
    proxyReq.setHeader('Accept-Encoding', 'UTF-8');
    console.log('Proxying from %s to %s', req.originalUrl, proxyReq.path);
}

export function onProxyRes(
    proxyRes: IncomingMessage,
    req: Request,
    res: Response,
): void {
    console.log(`Proxyed  ${req.method} to '${req.originalUrl}'`);
    console.log('Headers sent: ', res.headersSent);
    console.log('Status:', proxyRes.statusCode);
}

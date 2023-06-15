import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: Request, res: Response, next: () => void) {
    console.log('Headers sent: ', res.headersSent);
    const authorization = req.header('Authorization');
    if (!authorization) {
      throw new UnauthorizedException();
    }
    try {
      const token = authorization?.split(' ')[1];
      this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new ForbiddenException(error);
    }
    next();
  }
}

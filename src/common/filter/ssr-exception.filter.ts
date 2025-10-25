import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(HttpException, WsException)
export class SsrExceptionFilter
  implements ExceptionFilter<HttpException | WsException>
{
  catch(exception: HttpException | WsException, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      const ctx = host.switchToHttp();

      const res = ctx.getResponse<Response>();

      const status = exception.getStatus();
      const message = exception.message || 'Сталася помилка';

      if (status === 401) {
        return res.redirect('/login');
      }

      res.redirect(`/errors/${status}?message=${message}`);
    } else {
      const ctx = host.switchToWs();

      const client = ctx.getClient<Socket>();

      client.emit('error', exception.getError());
    }
  }
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class SsrExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const res = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const message = exception.message || 'Сталася помилка';

    if (status === 401) {
      return res.redirect('/login');
    }

    res.status(status).render(`errors/${status}.ejs`, { status, message });
  }
}

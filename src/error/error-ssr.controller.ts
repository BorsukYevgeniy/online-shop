import { Controller, Get, Res, Param, Query } from '@nestjs/common';
import { Response } from 'express';

@Controller('errors')
export class ErrorSsrController {
  @Get(':errorCode')
  async getErrorPage(
    @Param('errorCode') errorCode: 400 | 403 | 404 | 500,
    @Query('message') message: string,
    @Res() res: Response,
  ): Promise<void> {
    res
      .status(errorCode)
      .render(`errors/${errorCode}.ejs`, { status: errorCode, message });
  }
}

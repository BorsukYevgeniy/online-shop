import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ErrorSsrControllerDocs, RenderErrorPageDocs } from './docs/error-docs';

@ErrorSsrControllerDocs()
@Controller('errors')
export class ErrorSsrController {
  @RenderErrorPageDocs()
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

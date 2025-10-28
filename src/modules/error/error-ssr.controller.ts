import { Controller, Get, Res, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('SSR Errors')
@Controller('errors')
export class ErrorSsrController {
  @ApiOperation({ summary: 'Render error page' })
  @ApiParam({ name: 'errorCode', type: Number })
  @ApiQuery({ name: 'message', type: String })
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

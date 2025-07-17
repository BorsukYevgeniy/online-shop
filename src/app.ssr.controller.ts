import { Controller, Render, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('SSR App')
export class AppSsrController {
  @ApiOperation({ summary: 'Render home page' })
  @Get('')
  @Render('home')
  async getHomePage() {}
}

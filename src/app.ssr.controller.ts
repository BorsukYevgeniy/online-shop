import { Controller, Render, Get } from '@nestjs/common';

@Controller()
export class AppSsrController {
  @Get('')
  @Render('home')
  async getHomePage() {}
}

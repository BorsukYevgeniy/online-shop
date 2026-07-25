import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  app_port: process.env.APP_PORT,
  app_url: process.env.APP_URL,
}));

import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,

  access_token_expiration_time: process.env.ACCESS_TOKEN_EXPIRATION_TIME,

  refresh_token_expiration_time: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
}));

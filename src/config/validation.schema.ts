import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().port().default(3000),
  APP_URL: Joi.string().uri().default('http://localhost:3000'),

  DATABASE_URL: Joi.string().uri().required(),

  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),

  ACCESS_TOKEN_EXPIRATION_TIME: Joi.string()
    .pattern(/^\d+\s*(s|m|h|d|w|y)$/i)
    .required(),

  REFRESH_TOKEN_EXPIRATION_TIME: Joi.string()
    .pattern(/^\d+\s*(s|m|h|d|w|y)$/i)
    .required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),

  REDIS_URL: Joi.string().uri().required(),
  REDIS_TTL: Joi.number().default(60000),
});

import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.alternatives()
    .try(
      Joi.string().pattern(/^\d+$/).default('5000'),
      Joi.number().integer().min(1).default(5000)
    )
    .custom((value) => (typeof value === 'string' ? parseInt(value, 10) : value)),
  DATABASE_URL: Joi.string().required(),
  API_DATABASE_URL: Joi.string().optional(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRATION: Joi.string().default('15m'),
  REFRESH_EXPIRATION_DAYS: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+$/), Joi.number().integer())
    .default('7')
    .custom((value) => (typeof value === 'string' ? parseInt(value, 10) : value)),
  PASSWORD_SALT_ROUNDS: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+$/), Joi.number().integer())
    .default('12')
    .custom((value) => (typeof value === 'string' ? parseInt(value, 10) : value)),
  RATE_LIMIT_MAX: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+$/), Joi.number().integer())
    .default('120')
    .custom((value) => (typeof value === 'string' ? parseInt(value, 10) : value)),
  RATE_LIMIT_WINDOW_MIN: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+$/), Joi.number().integer())
    .default('15')
    .custom((value) => (typeof value === 'string' ? parseInt(value, 10) : value)),
  BLOCK_THRESHOLD: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+$/), Joi.number().integer())
    .default('3')
    .custom((value) => (typeof value === 'string' ? parseInt(value, 10) : value)),
  BLOCK_DURATION_MIN: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+$/), Joi.number().integer())
    .default('30')
    .custom((value) => (typeof value === 'string' ? parseInt(value, 10) : value)),
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+$/), Joi.number().integer())
    .default('587')
    .custom((value) => (typeof value === 'string' ? parseInt(value, 10) : value)),
  MAIL_USER: Joi.string().required(),
  MAIL_PASS: Joi.string().required(),
  MAIL_FROM: Joi.string().email().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  REQUIRE_EMAIL_VERIFICATION: Joi.boolean().default(true),
  TRIAL_DAYS: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+$/), Joi.number().integer())
    .default('7')
    .custom((value) => (typeof value === 'string' ? parseInt(value, 10) : value)),
  INVITE_DISCOUNT_DAYS: Joi.alternatives()
    .try(Joi.string().pattern(/^\d+$/), Joi.number().integer())
    .default('30')
    .custom((value) => (typeof value === 'string' ? parseInt(value, 10) : value)),
  INTERNAL_API_KEY: Joi.string().default('internal-only-key'),
  INTERNAL_API_ENABLED: Joi.boolean().default(false),
  TMDB_API_KEY: Joi.string().optional(),
});

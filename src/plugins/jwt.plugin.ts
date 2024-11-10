import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'

export const jwtPlugin = (app: Elysia) =>
  app
    .use(
      jwt({
        name: 'jwt',
        secret: Bun.env.JWT_SECRET!,
        exp: Bun.env.JWT_EXPIRY, //15m
      })
    )
    .use(
      jwt({
        name: 'jwtRefresh',
        secret: Bun.env.JWT_REFRESH_EXPIRY!,
        exp: '1d', //1d
      })
    )

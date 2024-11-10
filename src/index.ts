import { Elysia } from 'elysia'
import AuthRoutes from './routes/auth.routes'
import swagger from '@elysiajs/swagger'
import { AuthenticationException } from './exceptions/authentication.exception'
import { AuthorizationException } from './exceptions/authorization.exception'
import { match } from 'ts-pattern'
import { appLogger } from './utils/logger'

const app = new Elysia()
  .error('AUTHENTICATION_ERROR', AuthenticationException)
  .error('AUTHORIZATION_ERROR', AuthorizationException)
  .onError(({ error, code, set }) => {
    if ((code as unknown) == 'P2002') {
      set.status = 422
      appLogger.error(error)
      return {
        status: 'error',
        message: 'E-mail address already exists',
      }
    }

    switch (code) {
      case 'AUTHENTICATION_ERROR':
        appLogger.error(error)
        set.status = 401
        return {
          status: 'error',
          message: error.toString().replace('Error: ', ''),
        }
      case 'AUTHORIZATION_ERROR':
        appLogger.error(error)
        set.status = 403
        return {
          status: 'error',
          message: error.toString().replace('Error: ', ''),
        }
      case 'NOT_FOUND':
        appLogger.error(error)
        set.status = 404
        return {
          status: 'error',
          message: error.toString().replace('Error: ', ''),
        }
      case 'INTERNAL_SERVER_ERROR':
        appLogger.error(error)
        set.status = 500
        return {
          status: 'error',
          message: 'Something went wrong!',
        }
      case 'VALIDATION':
        appLogger.error(error)
        set.status = 400
        return {
          status: 'error',
          message: error,
        }
    }
  })
  .use(swagger())
  .use(AuthRoutes)
  .listen(3000)

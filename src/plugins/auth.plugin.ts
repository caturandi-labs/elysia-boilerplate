import { Elysia } from 'elysia'
import { jwtPlugin } from './jwt.plugin'
import { AuthorizationException } from '../exceptions/authorization.exception'
import { UserRepository } from '../repository/user.repository'
import { toUserResource } from '../models/user.model'
import bearer from '@elysiajs/bearer'

export const authPlugin = (app: Elysia) =>
  app
    .use(jwtPlugin)
    .use(bearer())
    .derive(async ({ set, bearer, cookie: { refreshTokenCookie } }) => {
      if (!refreshTokenCookie.value) {
        return
      }
      if (!bearer) {
        set.status = 401
        set.headers['WWW-Authenticate'] = `Bearer realm='sign', error="invalid_request"`
        throw new AuthorizationException('Unauthorized Access')
      }
    })
    .resolve(async ({ bearer, jwt, set, path }) => {
      if (!bearer || path.includes('refresh-token')) {
        return
      }

      const decoded = await jwt.verify(bearer)
      console.log(decoded)

      if (!decoded) {
        set.status = 401
        throw new AuthorizationException('Unauthorized')
      }
      const { sub } = decoded

      const user = await UserRepository.findUserWithDetails(sub!)

      if (!user) {
        set.status = 401
        throw new AuthorizationException('Unauthorized, user not found')
      }

      return {
        authenticatedUser: toUserResource(user),
      }
    })
    .macro(({ onBeforeHandle, onAfterHandle }) => {
      return {
        isSignIn(enabled: boolean) {
          if (!enabled) return

          onBeforeHandle(async ({ bearer, set }) => {
            if (!enabled) {
              return
            }
            if (!bearer) {
              set.status = 401
              throw new AuthorizationException('Unauthorized')
            }
          })
        },
        roles(list?: string[]) {
          onAfterHandle(async ({ set, authenticatedUser }) => {
            if (list?.length === 0) return

            if (authenticatedUser?.role) {
              if (!list?.includes(authenticatedUser.role)) {
                set.status = 403
                throw new AuthorizationException('Forbidden Access')
              }
            }
          })
        },
        permissions(list?: string[]) {
          if (list?.length === 0) return

          onAfterHandle(async ({ set, authenticatedUser }) => {
            if (list?.length === 0) return

            if (authenticatedUser?.permissions) {
            }
          })
        },
      }
    })

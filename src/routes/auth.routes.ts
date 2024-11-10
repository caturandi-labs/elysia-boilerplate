import { Elysia, t } from 'elysia'
import { AuthModel } from '../models/user.model'
import { authPlugin } from '../plugins/auth.plugin'
import { AuthenticationException } from '../exceptions/authentication.exception'
import { AuthServices } from '../services/auth.services'
import { AuthorizationException } from '../exceptions/authorization.exception'
import { UserRepository } from '../repository/user.repository'

const AuthRoutes = new Elysia({
  prefix: '/auth',
})
  .decorate('authService', new AuthServices())
  .model(AuthModel)
  .use(authPlugin)
  .post(
    '/register',
    async ({ body, set, authService }) => {
      const newUser = await authService.registerUser(body)
      set.status = 201

      return {
        message: 'Account Successfully registered',
        data: {
          ...newUser,
        },
      }
    },
    {
      body: 'auth.register',
      isSignIn: false,
    }
  )
  .post(
    '/login',
    async ({ body, authService, jwt, jwtRefresh, cookie: { refreshTokenCookie }, set }) => {
      const user = await authService.validateUser(body.email, body.password)

      if (!user) {
        set.status = 400
        throw new AuthenticationException('Your credentials is not valid')
      }

      const accessToken = await jwt.sign({
        sub: user.id,
      })

      const refreshToken = await jwtRefresh.sign({
        sub: user.id,
      })

      await authService.updateUserToken(user.id, refreshToken)

      refreshTokenCookie.set({
        value: refreshToken,
        httpOnly: true,
        path: '/',
        maxAge: 2 * 60, // 7 days = 7 * 86400s
        secure: Bun.env.APP_ENV === 'production',
      })

      set.status = 200

      return {
        data: {
          access_token: accessToken,
        },
      }
    },
    {
      body: 'auth.login',
      isSignIn: false,
    }
  )
  .post('/refresh-token', async ({ set, jwt, jwtRefresh, authService, cookie: { refreshTokenCookie }, headers }) => {
    if (!refreshTokenCookie.value) {
      set.status = 401
      throw new AuthenticationException('No Refresh token provided')
    }

    const decoded = await jwtRefresh.verify(refreshTokenCookie.value)

    if (!decoded) {
      set.status = 401
      throw new AuthorizationException('Unauthorized')
    }
    const { sub } = decoded

    const userId = sub

    if (!userId) {
      throw new AuthorizationException("Can't decode JWT Refresh Token")
    }
    const user = await UserRepository.findUserById(userId)
    if (user?.refresh_token !== refreshTokenCookie.value) {
      throw new AuthorizationException('Invalid Token')
    }

    const accessToken = await jwt.sign({
      sub: userId,
    })

    // Decode token to check expiration
    const decodedRefreshToken = await jwtRefresh.verify(refreshTokenCookie.value)
    if (!decodedRefreshToken) {
      throw new AuthorizationException('Refresh Token invalid')
    }
    if (!authService.isRefreshTokenValid(decodedRefreshToken)) {
      const refreshToken = await jwt.sign({
        sub: userId,
      })
      refreshTokenCookie.set({
        value: refreshToken,
        httpOnly: true,
        path: '/',
        maxAge: 2 * 60, // 7 days
      })

      await authService.updateUserToken(userId!, refreshToken)
    }

    set.headers['authorization'] = accessToken

    return {
      data: {
        access_token: accessToken,
      },
    }
  })
  .get(
    '/me',
    async ({ authenticatedUser }) => {
      return {
        ...authenticatedUser,
      }
    },
    {
      isSignIn: true,
      //   roles: ['admin'],
    }
  )

export default AuthRoutes

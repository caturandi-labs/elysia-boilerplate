import { registerDtoBody } from '../dto/user.dto'
import { ulid } from 'ulidx'
import { Prisma } from '@prisma/client'
import { UserRepository } from '../repository/user.repository'
import { JWTPayloadSpec } from '@elysiajs/jwt'

export class AuthServices {
  isRefreshTokenValid(decodedPayload: JWTPayloadSpec): boolean {
    if (decodedPayload.exp! < Date.now() / 1000) {
      return false
    }

    return true
  }

  async updateUserToken(userID: string, refreshToken: string): Promise<Prisma.UserUpdateInput> {
    return UserRepository.updateRefreshToken(userID, refreshToken)
  }

  async validateUser(
    email: string,
    password: string
  ): Promise<Prisma.UserGetPayload<{
    select: { id: true; email: true; password: true }
  }> | null> {
    const user = await UserRepository.findUser(email)

    if (!user) {
      return null
    }

    const passwordCheck = await Bun.password.verify(password, user.password, 'bcrypt')

    if (!passwordCheck) {
      return null
    }

    return user
  }

  async registerUser(body: registerDtoBody): Promise<Prisma.UserCreateInput> {
    const hashedPassword = await Bun.password.hash(body.password, {
      algorithm: 'bcrypt',
      cost: 10,
    })

    const payload: Prisma.UserCreateInput = {
      id: ulid(),
      email: body.email,
      password: hashedPassword,
      username: body.username,
    }

    return UserRepository.createUser(payload)
  }
}

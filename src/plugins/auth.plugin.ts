import {Elysia} from 'elysia'
import {jwtPlugin} from "./jwt.plugin";
import {AuthorizationException} from "../exceptions/authorization.exception";
import {prisma} from "../database/prisma";


export const authPlugin = (app: Elysia) => app
    .use(jwtPlugin)
    .macro(({onBeforeHandle}) => {
        return {
            isSignIn(enabled: boolean) {
                if (!enabled) return

                onBeforeHandle(
                    async ({cookie: {accessTokenCookie}, set}) => {
                        if (!enabled) {
                            return;
                        }
                        if (!accessTokenCookie.value) {
                            set.status = 401
                            throw new AuthorizationException("Unauthorized")
                        }

                    }
                )
            },
            roles(list?: string[]) {
                onBeforeHandle(
                    async ({set}) => {
                        if (list?.length === 0) return;
                    }
                )
            },
            permissions(list?: string[]) {
                console.log(list)
                if (list?.length === 0) return
            }
        }
    })
    .resolve(async ({cookie: {accessTokenCookie}, jwt, set}) => {
        if (!accessTokenCookie.value) {
            return
        }

        const decoded = await jwt.verify(accessTokenCookie.value)

        if (!decoded) {
            set.status = 401

            throw new AuthorizationException("Unauthorized")
        }
        const {sub} = decoded

        const user = await prisma.user.findUnique({where: {id: sub}})

        if (!user) {
            set.status = 401
            throw new AuthorizationException("Unauthorized, user not found")
        }

        return {
            authenticatedUser: user
        }
    })


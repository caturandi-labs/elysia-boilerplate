import {Elysia} from "elysia";
import {AuthModel} from "../models/user.model";
import {prisma} from "../database/prisma";
import {ulid} from "ulidx";
import {UserRepository} from "../repository/user.repository";
import {authPlugin} from "../plugins/auth.plugin";
import {AuthenticationException} from "../exceptions/authentication.exception";

const AuthRoutes = new Elysia({
    prefix: '/auth',
})
    .model(AuthModel)
    .use(authPlugin)
    .post('/register', async ({body, set}) => {
        const userPassword = await Bun.password.hash(body.password, {
            algorithm: "bcrypt",
            cost: 10
        });

        const newUser = await prisma.user.create({
            data: {
                ...body,
                id: ulid(),
                password: userPassword
            }
        })

        set.status = 201

        return {
            message: "Account Successfully created",
            data: {
                ...newUser
            }
        }
    }, {
        body: 'auth.register',
        isSignIn: false
    })
    .post('/login', async ({body, jwt, jwtRefresh, cookie: {accessTokenCookie, refreshTokenCookie}, set}) => {

        const user = await UserRepository.findUser(body.email)

        if (!user) {
            set.status = 400
            throw new AuthenticationException(
                "Email is not yet registered in this system, Please check again"
            )
        }

        const passwordCheck = await Bun.password.verify(
            body.password,
            user.password,
            "bcrypt"
        )

        if (!passwordCheck) {
            set.status = "Bad Request"
            throw new AuthenticationException(
                "Password doesn't match"
            )
        }

        const accessToken = await jwt.sign({
            sub: user.id,
        })

        const refreshToken = await jwtRefresh.sign({
            sub: user.id,
        })


        await UserRepository.updateRefreshToken(user.id, refreshToken)


        accessTokenCookie.set({
            value: accessToken,
            httpOnly: true,
            path: "/",
        });


        refreshTokenCookie.set({
            value: refreshToken,
            httpOnly: true,
            path: "/",
        });

        set.status = 200

        return {
            data: {
                access_token: accessToken,
                refresh_token: refreshToken
            }
        }

    }, {body: 'auth.login', isSignIn: false})
    .get('/me', async ({authenticatedUser}) => {
        return {
            ...authenticatedUser
        }
    }, {
        isSignIn: true,
    })

export default AuthRoutes;
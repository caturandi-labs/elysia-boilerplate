import {Elysia} from "elysia";
import {AuthModel} from "../models/user.model";
import {jwt} from "@elysiajs/jwt";
import {prisma} from "../database/prisma";
import {ulid} from "ulidx";
import {UserRepository} from "../repository/user.repository";

const AuthRoutes = new Elysia({
    prefix: '/auth',
})
    .model(AuthModel)
    .use(jwt({
        name: 'jwt',
        secret: Bun.env.JWT_SECRET!,
        exp: '1d'
    }))
    .use(jwt({
        name: 'jwtRefresh',
        secret: Bun.env.JWT_SECRET!,
    }))
    .post('/register', async ({body, set}) => {
        const userPassword = await Bun.password.hash(body.password, {
            algorithm: "bcrypt",
            cost: 10
        });

        const newUser = await prisma.user.create({
            data: {
                ...body,
                id: ulid().toString(),
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
    })
    .post('/login', async ({body, jwt, jwtRefresh, cookie: {accessTokenCookie, refreshTokenCookie}, set}) => {

        const user = await UserRepository.findUser(body.email)

        if (!user) {
            set.status = 400
            throw new Error(
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
            throw new Error(
                "Password doesn't match"
            )
        }

        const accessToken = await jwt.sign({
            sub: user.id,
            maxAge: 86400,
        })

        const refreshToken = await jwtRefresh.sign({
            sub: user.id,
            maxAge: 86400,
        })

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refresh_token: refreshToken
            },
        });


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

    }, {body: 'auth.login'});

export default AuthRoutes;
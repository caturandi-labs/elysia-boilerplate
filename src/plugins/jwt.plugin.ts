import {Elysia} from "elysia";
import {jwt} from "@elysiajs/jwt";

export const jwtPlugin = (app: Elysia)=> app
    .use(jwt({
        name: 'jwt',
        secret: Bun.env.JWT_SECRET!,
        exp: '1d'
    }))
    .use(jwt({
        name: 'jwtRefresh',
        secret: Bun.env.JWT_SECRET!,
    }))
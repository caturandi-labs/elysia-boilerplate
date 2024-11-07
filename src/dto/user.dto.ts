import {t} from "elysia";

export const registerDto = t.Object({
    username: t.String({
        required: true,
        minLength: 2,
    }),
    email: t.String({
        required: true,
        format: 'email',
    }),
    password: t.String({
        required: true,
        minLength: 6
    }),
})

export const loginDto = t.Object({
    email: t.String({
        required: true,
        format: 'email',
    }),
    password: t.String({
        required: true,
        minLength: 6
    }),
})



export type registerDtoBody = typeof registerDto.static
export type loginDtoBody = typeof loginDto.static

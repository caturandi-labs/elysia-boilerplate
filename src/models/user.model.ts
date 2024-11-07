import {loginDto, registerDto} from "../dto/user.dto";
import {Prisma, User} from "@prisma/client";

export const AuthModel = {
    'auth.register': registerDto,
    'auth.login': loginDto,
}

export type UserResource = {
    id: string,
    email: string,
    username: string,
    role?: string
    permissions?: string[],
}


type UserWithRoleAndPermissions = Prisma.UserGetPayload<{
    include: {
        role: {
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            }
        },
    }
}>

export function toUserResource(user: UserWithRoleAndPermissions): UserResource {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user?.role?.name,
        permissions: user?.role?.permissions.map(item => item.permission.name),
    }
}
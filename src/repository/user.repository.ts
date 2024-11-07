import {prisma} from "../database/prisma";
import {Prisma} from "@prisma/client"


export class UserRepository {

    static createUser(data: Prisma.UserCreateInput): Promise<Prisma.UserCreateInput> {
        return prisma.user.create({
            data
        })
    }

    static findUserWithDetails(id: string): Promise<Prisma.UserGetPayload<{
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
    }> | null> {

        return prisma.user.findFirst({
            where: {id},
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
        })
    }

    static findUser(email: string): Promise<Prisma.UserGetPayload<{
        select: {
            id: true,
            email: true,
            password: true,
        }
    }> | null> {
        return prisma.user.findUnique({
            where: {email},
            select: {
                id: true,
                email: true,
                password: true,
            }
        });
    }

    static updateRefreshToken(id: string, token: string): Promise<Prisma.UserUpdateInput> {
        return prisma.user.update({
            where: {
                id: id,
            },
            data: {
                refresh_token: token
            },
        });
    }

}
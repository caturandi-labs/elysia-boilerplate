import {prisma} from "../database/prisma";


export class UserRepository {
    static async findUser(email: string) {
        return prisma.user.findUnique({
            where: {email},
            select: {
                id: true,
                email: true,
                password: true,
            },
        });
    }

    static async updateRefreshToken(id: string, token: string) {
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
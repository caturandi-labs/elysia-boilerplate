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
}
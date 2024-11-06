import {prisma} from "./prisma";
import {ulid} from "ulidx";
import {Permission} from "@prisma/client";
import {randEmail, randUserName} from "@ngneat/falso";

const main = async () => {

    const permissions: string[] = ["user-management", "role-management", "permission-management"]

    for (const item of permissions) {
        await prisma.permission.upsert({
            where: {
                name: item
            },
            update: {},
            create: {
                id: ulid(),
                name: item
            }
        })
    }

    const adminRole = await prisma.role.upsert({
        where: {
            name: "admin"
        },
        update: {},
        create: {
            id: ulid(),
            name: "admin",
        }
    })

    const permissionsData: Permission[] = await prisma.permission.findMany()

    for (const permission of permissionsData) {
        await prisma.rolePermissions.create({
            data: {
                roleId: adminRole.id,
                permissionId: permission.id
            }
        })
    }

    const password = await Bun.password.hash('password', "bcrypt");

    await prisma.user.createMany({
        data: [
            {id: ulid(), email: randEmail(),password , role_id: adminRole.id, username: randUserName() },
            {id: ulid(), email: randEmail(),password , role_id: adminRole.id, username: randUserName() },
            {id: ulid(), email: randEmail(),password , role_id: adminRole.id, username: randUserName() },
            {id: ulid(), email: randEmail(),password , role_id: adminRole.id, username: randUserName() },
            {id: ulid(), email: randEmail(),password , role_id: adminRole.id, username: randUserName() },
        ]
    })

    console.info("--- DATA SEED SUCCESSFULLY ---")

}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
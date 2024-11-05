import { Elysia } from "elysia";
import AuthRoutes from "./routes/auth.routes";
import swagger from "@elysiajs/swagger";

const app = new Elysia()
    .use(swagger())
    .use(AuthRoutes)
    .onError((err) => {
        if ((err.code as unknown) === 'P2002') {
            err.set.status = 422
            return {
                message: "E-mail address already exists"
            }
        }
    })
    .listen(3000);


import {Elysia} from "elysia";
import AuthRoutes from "./routes/auth.routes";
import swagger from "@elysiajs/swagger";
import {AuthenticationException} from "./exceptions/authentication.exception";
import {AuthorizationException} from "./exceptions/authorization.exception";

const app = new Elysia()
    .error('AUTHENTICATION_ERROR', AuthenticationException)
    .error('AUTHORIZATION_ERROR', AuthorizationException)
    .onError(({error, code, set}) => {

        if ((code as unknown) == 'P2002') {
            set.status = 422
            return {
                status: "error",
                message: "E-mail address already exists"
            }
        }

        switch (code) {
            case 'AUTHENTICATION_ERROR':
                set.status = 401
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", "")
                }
            case 'AUTHORIZATION_ERROR':
                set.status = 403
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", "")
                }
            case 'NOT_FOUND':
                set.status = 404
                return {
                    status: "error",
                    message: error.toString().replace("Error: ", "")
                }
            case 'INTERNAL_SERVER_ERROR':
                set.status = 500
                return {
                    status: "error",
                    message: "Something went wrong!"
                }
            case 'VALIDATION':
                set.status = 400
                return {
                    status: "error",
                    message: error.validator.Errors
                }
        }
    })
    .use(swagger())
    .use(AuthRoutes)
    .listen(3000);


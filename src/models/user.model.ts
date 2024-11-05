import {loginDto, registerDto} from "../dto/user.dto";

export const AuthModel = {
    'auth.register': registerDto,
    'auth.login': loginDto,
}
export class AuthenticationException extends Error {
    constructor(public message: string) {
        super(message);
    }
}
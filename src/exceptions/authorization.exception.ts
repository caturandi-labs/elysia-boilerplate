export class AuthorizationException extends Error {
    constructor(public message: string) {
        super(message);
    }
}
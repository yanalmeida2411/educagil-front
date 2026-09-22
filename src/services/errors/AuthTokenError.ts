export class AuthTokenError extends Error{
    constructor(){
        super('Error ao autenticar o token.')
    }
}
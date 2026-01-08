export class AppError extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'You are unable to do that') {
        super(message, 404)
    }
}
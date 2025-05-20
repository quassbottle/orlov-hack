import { HttpStatus } from '@nestjs/common';
import { isBoolean } from 'class-validator';

export const HTTP_STATUS_ALREADY_REPORT = 208;

export type ErrorOptions = {
    payload?: Record<string, unknown>;
    message?: string;
    status?: number;
    needLog?: boolean;
};

export class BaseError<E> {
    error: E;
    status: number;
    message?: string;
    payload?: Record<string, unknown>;
    needLog: boolean;

    constructor(error: E, options?: ErrorOptions) {
        this.error = error;
        this.payload = options?.payload;
        this.message = options?.message;
        this.status = options?.status ?? 200;
        this.needLog = isBoolean(options?.needLog) ? Boolean(options?.needLog) : true;
    }
}

export class InternalServerError<E> extends BaseError<E> {
    constructor(error: E, options?: Omit<ErrorOptions, 'status'>) {
        super(error, { ...options, status: HttpStatus.INTERNAL_SERVER_ERROR });
    }
}

export class BadRequestError extends BaseError<'badRequest'> {
    constructor(message: string) {
        super('badRequest', { status: HttpStatus.BAD_REQUEST, message });
    }
}

export class NotFoundError extends BaseError<'notFound'> {
    constructor(message: string, options?: { needLog?: boolean }) {
        super('notFound', { status: HttpStatus.NOT_FOUND, message, needLog: options?.needLog });
    }
}

export class UnauthorizedError extends BaseError<'unauthorized'> {
    constructor() {
        super('unauthorized', { status: HttpStatus.UNAUTHORIZED });
    }
}

export function isError<T, E, BE extends BaseError<E>>(value: T | BE): value is BE {
    return value instanceof BaseError;
}

export function isBaseErrorString(be: BaseError<unknown>): be is BaseError<string> {
    return typeof be.error === 'string';
}

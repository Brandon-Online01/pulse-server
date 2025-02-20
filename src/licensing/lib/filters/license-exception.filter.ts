import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class LicenseException extends HttpException {
    constructor(message: string, status: HttpStatus) {
        super({
            status,
            error: 'License Error',
            message,
        }, status);
    }
}

@Catch(LicenseException)
export class LicenseExceptionFilter implements ExceptionFilter {
    catch(exception: LicenseException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse() as any;

        response
            .status(status)
            .json({
                timestamp: new Date().toISOString(),
                path: ctx.getRequest().url,
                ...exceptionResponse,
            });
    }
} 
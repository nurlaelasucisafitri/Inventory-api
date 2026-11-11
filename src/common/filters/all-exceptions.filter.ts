import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

// Menangkap semua error dan mengubahnya menjadi format response error yang seragam.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let error = 'Internal Server Error';
        let message: string | string[] = 'Terjadi kesalahan pada server';

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const body = exception.getResponse();
            if (typeof body === 'string') {
                message = body;
            } else {
                const res = body as { message?: string | string[]; error?: string };
                message = res.message ?? exception.message;
                error = res.error ?? exception.name;
            }
        } else if (exception instanceof QueryFailedError) {
            // jaring pengaman untuk error database yang lolos dari pengecekan di service
            const code = (exception as unknown as { driverError?: { code?: string } }).driverError?.code;
            if (code === '23505') {
                statusCode = HttpStatus.CONFLICT;
                error = 'Conflict';
                message = 'Data duplikat: nilai unik sudah dipakai';
            } else if (code === '23503') {
                statusCode = HttpStatus.CONFLICT;
                error = 'Conflict';
                message = 'Data masih berelasi dengan data lain';
            } else if (code === '22P02') {
                statusCode = HttpStatus.BAD_REQUEST;
                error = 'Bad Request';
                message = 'Format data tidak valid';
            } else {
                this.logger.error(exception.message, exception.stack);
            }
        } else {
            this.logger.error(String(exception), (exception as Error)?.stack);
        }

        response.status(statusCode).json({
            success: false,
            statusCode,
            error,
            message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
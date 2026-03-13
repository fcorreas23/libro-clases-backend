import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const UNIQUE_FIELD_MESSAGES: Record<string, string> = {
  employee_code: 'El código de empleado ya está en uso',
  email: 'El correo electrónico ya está en uso',
  rut: 'El RUT ya está en uso',
  name: 'El nombre ya está en uso',
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const fields = (exception.meta?.target as string[]) ?? [];
        const fieldKey = fields[0] ?? '';
        const message =
          UNIQUE_FIELD_MESSAGES[fieldKey] ??
          `El valor del campo '${fieldKey}' ya existe`;

        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message,
        });
      }

      case 'P2025': {
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'El registro no fue encontrado',
        });
      }

      default: {
        this.logger.error(
          `Prisma error ${exception.code}: ${exception.message}`,
          exception.stack,
        );
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Internal server error',
        });
      }
    }
  }
}

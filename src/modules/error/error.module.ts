import { Module } from '@nestjs/common';
import { ErrorSsrController } from './error-ssr.controller';

@Module({ controllers: [ErrorSsrController] })
export class ErrorModule {}

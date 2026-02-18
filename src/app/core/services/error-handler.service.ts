import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '@env';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    if (!environment.production) {
      console.error('Unhandled error:', error);
    }

    this.reportError(message, stack);
  }

  private reportError(_message: string, _stack?: string): void {
    // Integration point for remote error reporting (Sentry, Datadog, etc.)
    // Example:
    //   Sentry.captureException(new Error(message), { extra: { stack } });
  }
}

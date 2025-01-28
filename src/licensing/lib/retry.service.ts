import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface RetryOptions {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
    timeout?: number;
    retryableErrors?: Array<string | RegExp>;
}

export interface RetryResult<T> {
    success: boolean;
    result?: T;
    error?: Error;
    attempts: number;
    totalTime: number;
}

@Injectable()
export class RetryService {
    private readonly logger = new Logger(RetryService.name);

    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly defaultOptions: RetryOptions = {
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 10000,
            backoffFactor: 2,
            timeout: 30000,
            retryableErrors: [],
        }
    ) { }

    async retry<T>(
        operation: () => Promise<T>,
        options: Partial<RetryOptions> = {}
    ): Promise<RetryResult<T>> {
        const startTime = Date.now();
        const finalOptions = { ...this.defaultOptions, ...options };
        let attempts = 0;
        let lastError: Error | undefined;
        let delay = finalOptions.initialDelay;

        while (attempts < finalOptions.maxAttempts) {
            attempts++;
            try {
                const result = await this.executeWithTimeout(
                    operation,
                    finalOptions.timeout
                );

                this.emitSuccess(attempts);
                return {
                    success: true,
                    result,
                    attempts,
                    totalTime: Date.now() - startTime,
                };
            } catch (error) {
                lastError = error as Error;
                if (!this.shouldRetry(error as Error, finalOptions)) {
                    break;
                }

                if (attempts < finalOptions.maxAttempts) {
                    this.logger.warn(
                        `Attempt ${attempts} failed, retrying in ${delay}ms`,
                        error
                    );
                    await this.sleep(delay);
                    delay = Math.min(
                        delay * finalOptions.backoffFactor,
                        finalOptions.maxDelay
                    );
                }
            }
        }

        this.emitFailure(attempts, lastError);
        return {
            success: false,
            error: lastError,
            attempts,
            totalTime: Date.now() - startTime,
        };
    }

    private async executeWithTimeout<T>(
        operation: () => Promise<T>,
        timeout?: number
    ): Promise<T> {
        if (!timeout) {
            return operation();
        }

        return Promise.race([
            operation(),
            new Promise<T>((_, reject) =>
                setTimeout(
                    () => reject(new Error('Operation timed out')),
                    timeout
                )
            ),
        ]);
    }

    private shouldRetry(error: Error, options: RetryOptions): boolean {
        if (!options.retryableErrors || options.retryableErrors.length === 0) {
            return true;
        }

        return options.retryableErrors.some((pattern) => {
            if (typeof pattern === 'string') {
                return error.message.includes(pattern);
            }
            return pattern.test(error.message);
        });
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private emitSuccess(attempts: number): void {
        this.eventEmitter.emit('retry.success', {
            attempts,
            timestamp: new Date(),
        });
    }

    private emitFailure(attempts: number, error?: Error): void {
        this.eventEmitter.emit('retry.failure', {
            attempts,
            error,
            timestamp: new Date(),
        });
    }
} 
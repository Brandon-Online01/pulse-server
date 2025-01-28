import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export enum CircuitState {
    CLOSED = 'CLOSED',
    OPEN = 'OPEN',
    HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
    failureThreshold: number;
    resetTimeout: number;
    halfOpenRetries: number;
}

@Injectable()
export class CircuitBreakerService {
    private readonly logger = new Logger(CircuitBreakerService.name);
    private state: CircuitState = CircuitState.CLOSED;
    private failures = 0;
    private lastFailureTime?: number;
    private successfulHalfOpenCalls = 0;

    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly options: CircuitBreakerOptions = {
            failureThreshold: 5,
            resetTimeout: 60000,
            halfOpenRetries: 3,
        }
    ) { }

    async execute<T>(
        command: () => Promise<T>,
        fallback?: () => Promise<T>
    ): Promise<T> {
        try {
            if (this.isOpen()) {
                if (this.shouldAttemptReset()) {
                    this.transitionToHalfOpen();
                } else {
                    return await this.handleOpenCircuit(fallback);
                }
            }

            const result = await command();

            if (this.state === CircuitState.HALF_OPEN) {
                this.handleHalfOpenSuccess();
            } else {
                this.reset();
            }

            return result;
        } catch (error) {
            return await this.handleFailure(error, fallback);
        }
    }

    private isOpen(): boolean {
        return this.state === CircuitState.OPEN;
    }

    private shouldAttemptReset(): boolean {
        if (!this.lastFailureTime) return false;
        const now = Date.now();
        return now - this.lastFailureTime >= this.options.resetTimeout;
    }

    private transitionToHalfOpen(): void {
        this.state = CircuitState.HALF_OPEN;
        this.successfulHalfOpenCalls = 0;
        this.eventEmitter.emit('circuit.half-open');
        this.logger.log('Circuit transitioned to HALF_OPEN state');
    }

    private async handleOpenCircuit<T>(
        fallback?: () => Promise<T>
    ): Promise<T> {
        if (fallback) {
            return await fallback();
        }
        throw new Error('Circuit breaker is OPEN');
    }

    private handleHalfOpenSuccess(): void {
        this.successfulHalfOpenCalls++;
        if (this.successfulHalfOpenCalls >= this.options.halfOpenRetries) {
            this.reset();
        }
    }

    private async handleFailure<T>(
        error: Error,
        fallback?: () => Promise<T>
    ): Promise<T> {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.options.failureThreshold) {
            this.trip();
        }

        if (fallback) {
            return await fallback();
        }
        throw error;
    }

    private trip(): void {
        this.state = CircuitState.OPEN;
        this.eventEmitter.emit('circuit.open');
        this.logger.warn('Circuit breaker tripped - circuit is now OPEN');
    }

    private reset(): void {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.lastFailureTime = undefined;
        this.successfulHalfOpenCalls = 0;
        this.eventEmitter.emit('circuit.close');
        this.logger.log('Circuit breaker reset - circuit is now CLOSED');
    }

    getState(): CircuitState {
        return this.state;
    }

    getFailures(): number {
        return this.failures;
    }
} 
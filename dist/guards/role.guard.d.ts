import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { BaseGuard } from './base.guard';
import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class RoleGuard extends BaseGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector, jwtService: JwtService);
    canActivate(context: ExecutionContext): boolean;
}

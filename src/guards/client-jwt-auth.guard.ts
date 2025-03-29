import { Injectable, ExecutionContext, UnauthorizedException, CanActivate } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { AccessLevel } from '../lib/enums/user.enums';

@Injectable()
export class ClientJwtAuthGuard implements CanActivate {
	constructor(private reflector: Reflector, private jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException('Missing authentication token');
		}

		try {
			const payload = await this.jwtService.verifyAsync(token);

			// Ensure the token is for a client
			if (payload.role !== AccessLevel.CLIENT) {
				throw new UnauthorizedException('Invalid access token');
			}

			request.user = payload;
			return true;
		} catch (error) {
			throw new UnauthorizedException('Invalid access token');
		}
	}

	private extractTokenFromHeader(request: any): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}

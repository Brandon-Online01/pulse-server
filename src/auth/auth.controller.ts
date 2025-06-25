import {
	Controller,
	Post,
	Body,
	HttpCode,
	HttpStatus,
	Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SignInInput, SignUpInput, VerifyEmailInput, SetPasswordInput, ForgotPasswordInput, ResetPasswordInput } from './dto/auth.dto';
import { 
	ApiOperation, 
	ApiTags, 
	ApiBody,
	ApiOkResponse,
	ApiCreatedResponse,
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { isPublic } from '../decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('sign-up')
	@isPublic()
	@ApiOperation({ 
		summary: 'Sign up',
		description: 'Initiates the sign-up process for a new user'
	})
	@ApiBody({ type: SignUpInput })
	@ApiCreatedResponse({ 
		description: 'Sign-up initiated successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Verification email sent' }
			}
		}
	})
	@ApiBadRequestResponse({ 
		description: 'Bad Request - Invalid data provided',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Invalid email format' }
			}
		}
	})
	@ApiConflictResponse({ 
		description: 'Conflict - Email already in use',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Email already in use' }
			}
		}
	})
	signUp(@Body() signUpInput: SignUpInput) {
		return this.authService.signUp(signUpInput);
	}

	@Post('verify-email')
	@isPublic()
	@ApiOperation({ 
		summary: 'Verify email',
		description: 'Verifies a user email using the token received via email'
	})
	@ApiBody({ type: VerifyEmailInput })
	@ApiOkResponse({ 
		description: 'Email verified successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Email verified' }
			}
		}
	})
	@ApiBadRequestResponse({ 
		description: 'Bad Request - Invalid token',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Invalid or expired token' }
			}
		}
	})
	@HttpCode(HttpStatus.OK)
	verifyEmail(@Body() verifyEmailInput: VerifyEmailInput, @Req() req: Request) {
		// Extract request data for email verification confirmation
		const ipAddress = this.extractIpAddress(req);
		const userAgent = req.headers['user-agent'] || 'Unknown';
		const deviceInfo = this.extractDeviceInfo(userAgent);

		const requestData = {
			ipAddress,
			userAgent,
			deviceType: deviceInfo.deviceType,
			browser: deviceInfo.browser,
			operatingSystem: deviceInfo.os
		};

		return this.authService.verifyEmail(verifyEmailInput, requestData);
	}

	@Post('set-password')
	@isPublic()
	@ApiOperation({ 
		summary: 'Set password',
		description: 'Sets the user password after email verification'
	})
	@ApiBody({ type: SetPasswordInput })
	@ApiOkResponse({ 
		description: 'Password set successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Password set successfully' }
			}
		}
	})
	@ApiBadRequestResponse({ 
		description: 'Bad Request - Invalid token or password',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Invalid token or password requirements not met' }
			}
		}
	})
	@HttpCode(HttpStatus.OK)
	setPassword(@Body() setPasswordInput: SetPasswordInput) {
		return this.authService.setPassword(setPasswordInput);
	}

	@Post('forgot-password')
	@isPublic()
	@ApiOperation({ 
		summary: 'Forgot password',
		description: 'Requests a password reset email'
	})
	@ApiBody({ type: ForgotPasswordInput })
	@ApiOkResponse({ 
		description: 'Password reset email sent',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Password reset email sent' }
			}
		}
	})
	@ApiBadRequestResponse({ 
		description: 'Bad Request - Invalid email',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Email not found' }
			}
		}
	})
	@HttpCode(HttpStatus.OK)
	forgotPassword(@Body() forgotPasswordInput: ForgotPasswordInput) {
		return this.authService.forgotPassword(forgotPasswordInput);
	}

	@Post('reset-password')
	@isPublic()
	@ApiOperation({ 
		summary: 'Reset password',
		description: 'Resets the user password using a token received via email'
	})
	@ApiBody({ type: ResetPasswordInput })
	@ApiOkResponse({ 
		description: 'Password reset successfully',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Password reset successfully' }
			}
		}
	})
	@ApiBadRequestResponse({ 
		description: 'Bad Request - Invalid token or password',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Invalid token or password requirements not met' }
			}
		}
	})
	@HttpCode(HttpStatus.OK)
	resetPassword(@Body() resetPasswordInput: ResetPasswordInput) {
		return this.authService.resetPassword(resetPasswordInput);
	}

	@Post('sign-in')
	@isPublic()
	@ApiOperation({ 
		summary: 'Sign in',
		description: 'Authenticates a user using email and password'
	})
	@ApiBody({ type: SignInInput })
	@ApiOkResponse({ 
		description: 'Authentication successful',
		schema: {
			type: 'object',
			properties: {
				accessToken: { type: 'string' },
				refreshToken: { type: 'string' },
				user: {
					type: 'object',
					properties: {
						uid: { type: 'number' },
						email: { type: 'string' },
						role: { type: 'string' },
						// Other user properties
					}
				}
			}
		}
	})
	@ApiUnauthorizedResponse({ 
		description: 'Unauthorized - Invalid credentials',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Invalid credentials' }
			}
		}
	})
	signIn(@Body() signInInput: SignInInput, @Req() req: Request) {
		// Extract request data
		const ipAddress = this.extractIpAddress(req);
		const userAgent = req.headers['user-agent'] || 'Unknown';
		const deviceInfo = this.extractDeviceInfo(userAgent);
		const location = this.extractLocationInfo(req);

		const requestData = {
			ipAddress,
			userAgent,
			deviceType: deviceInfo.deviceType,
			browser: deviceInfo.browser,
			operatingSystem: deviceInfo.os,
			location: location.city || 'Unknown',
			country: location.country || 'Unknown'
		};

		return this.authService.signIn(signInInput, requestData);
	}

	@Post('refresh')
	@isPublic()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ 
		summary: 'Refresh token',
		description: 'Generates a new access token using a valid refresh token'
	})
	@ApiBody({ 
		schema: {
			type: 'object',
			properties: {
				refreshToken: { type: 'string' }
			},
			required: ['refreshToken']
		}
	})
	@ApiOkResponse({ 
		description: 'Token refreshed successfully',
		schema: {
			type: 'object',
			properties: {
				accessToken: { type: 'string' },
				refreshToken: { type: 'string' }
			}
		}
	})
	@ApiUnauthorizedResponse({ 
		description: 'Unauthorized - Invalid refresh token',
		schema: {
			type: 'object',
			properties: {
				message: { type: 'string', example: 'Invalid refresh token' }
			}
		}
	})
	async refreshToken(@Body('refreshToken') refreshToken: string) {
		return this.authService.refreshToken(refreshToken);
	}

	/**
	 * Extract IP address from request
	 */
	private extractIpAddress(req: Request): string {
		return (
			req.headers['x-forwarded-for'] ||
			req.headers['x-real-ip'] ||
			req.connection?.remoteAddress ||
			req.socket?.remoteAddress ||
			(req.connection as any)?.socket?.remoteAddress ||
			req.ip ||
			'Unknown'
		) as string;
	}

	/**
	 * Extract device information from user agent
	 */
	private extractDeviceInfo(userAgent: string): {
		deviceType: string;
		browser: string;
		os: string;
	} {
		const ua = userAgent.toLowerCase();
		
		// Device type detection
		let deviceType = 'Desktop';
		if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
			deviceType = 'Mobile';
		} else if (ua.includes('tablet') || ua.includes('ipad')) {
			deviceType = 'Tablet';
		}

		// Browser detection
		let browser = 'Unknown';
		if (ua.includes('chrome') && !ua.includes('edg')) {
			browser = 'Chrome';
		} else if (ua.includes('firefox')) {
			browser = 'Firefox';
		} else if (ua.includes('safari') && !ua.includes('chrome')) {
			browser = 'Safari';
		} else if (ua.includes('edg')) {
			browser = 'Edge';
		} else if (ua.includes('opera') || ua.includes('opr')) {
			browser = 'Opera';
		}

		// OS detection
		let os = 'Unknown';
		if (ua.includes('windows')) {
			os = 'Windows';
		} else if (ua.includes('mac')) {
			os = 'macOS';
		} else if (ua.includes('linux')) {
			os = 'Linux';
		} else if (ua.includes('android')) {
			os = 'Android';
		} else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
			os = 'iOS';
		}

		return { deviceType, browser, os };
	}

	/**
	 * Extract location information from request headers
	 */
	private extractLocationInfo(req: Request): {
		city?: string;
		country?: string;
	} {
		// This is a simplified version. In production, you'd use a GeoIP service
		const cfCountry = req.headers['cf-ipcountry'] as string;
		const cfCity = req.headers['cf-ipcity'] as string;
		
		return {
			country: cfCountry || undefined,
			city: cfCity || undefined
		};
	}
}

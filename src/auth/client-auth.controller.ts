import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ClientAuthService } from './client-auth.service';
import { 
    ClientSignInInput, 
    ClientForgotPasswordInput, 
    ClientResetPasswordInput 
} from './dto/client-auth.dto';
import { 
    ApiOperation, 
    ApiTags, 
    ApiBody,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { isPublic } from '../decorators/public.decorator';

@ApiTags('client-auth')
@Controller('client-auth')
export class ClientAuthController {
    constructor(private readonly clientAuthService: ClientAuthService) {}

    @Post('sign-in')
    @isPublic()
    @ApiOperation({ 
        summary: 'Client sign in',
        description: 'Authenticates a client using email and password'
    })
    @ApiBody({ type: ClientSignInInput })
    @ApiOkResponse({ 
        description: 'Authentication successful',
        schema: {
            type: 'object',
            properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
                profileData: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        email: { type: 'string' },
                        licenseInfo: {
                            type: 'object',
                            properties: {
                                licenseId: { type: 'string' },
                                plan: { type: 'string' },
                                status: { type: 'string' },
                                features: { type: 'object' }
                            }
                        }
                    }
                },
                message: { type: 'string' }
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
    @HttpCode(HttpStatus.OK)
    signIn(@Body() signInInput: ClientSignInInput, @Req() req: Request) {
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

        return this.clientAuthService.clientSignIn(signInInput, requestData);
    }

    @Post('forgot-password')
    @isPublic()
    @ApiOperation({ 
        summary: 'Client forgot password',
        description: 'Requests a password reset email for client'
    })
    @ApiBody({ type: ClientForgotPasswordInput })
    @ApiOkResponse({ 
        description: 'Password reset email sent',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Password reset email sent' }
            }
        }
    })
    @HttpCode(HttpStatus.OK)
    forgotPassword(@Body() forgotPasswordInput: ClientForgotPasswordInput) {
        return this.clientAuthService.clientForgotPassword(forgotPasswordInput);
    }

    @Post('reset-password')
    @isPublic()
    @ApiOperation({ 
        summary: 'Client reset password',
        description: 'Resets the client password using a token received via email'
    })
    @ApiBody({ type: ClientResetPasswordInput })
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
    resetPassword(@Body() resetPasswordInput: ClientResetPasswordInput) {
        return this.clientAuthService.clientResetPassword(resetPasswordInput);
    }

    @Post('refresh')
    @isPublic()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'Refresh client token',
        description: 'Generates a new access token for client using a valid refresh token'
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
                refreshToken: { type: 'string' },
                profileData: { 
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        email: { type: 'string' },
                        licenseInfo: {
                            type: 'object',
                            properties: {
                                licenseId: { type: 'string' },
                                plan: { type: 'string' },
                                status: { type: 'string' },
                                features: { type: 'object' }
                            }
                        }
                    }
                },
                message: { type: 'string' }
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
    refresh(@Body() refreshTokenDto: { refreshToken: string }) {
        return this.clientAuthService.clientRefreshToken(refreshTokenDto.refreshToken);
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
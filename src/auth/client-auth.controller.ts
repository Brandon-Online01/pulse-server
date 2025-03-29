import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
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
                client: {
                    type: 'object',
                    properties: {
                        uid: { type: 'number' },
                        email: { type: 'string' }
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
    @HttpCode(HttpStatus.OK)
    signIn(@Body() signInInput: ClientSignInInput) {
        return this.clientAuthService.clientSignIn(signInInput);
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
                client: { type: 'object' }
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
} 
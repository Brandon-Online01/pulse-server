import {
	Controller,
	Post,
	Body,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInInput, SignUpInput, VerifyEmailInput, SetPasswordInput, ForgotPasswordInput, ResetPasswordInput } from './dto/auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { isPublic } from '../decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('sign-up')
	@isPublic()
	@ApiOperation({ summary: 'initiate the sign up process' })
	signUp(@Body() signUpInput: SignUpInput) {
		return this.authService.signUp(signUpInput);
	}

	@Post('verify-email')
	@isPublic()
	@ApiOperation({ summary: 'verify email using token from email' })
	@HttpCode(HttpStatus.OK)
	verifyEmail(@Body() verifyEmailInput: VerifyEmailInput) {
		return this.authService.verifyEmail(verifyEmailInput);
	}

	@Post('set-password')
	@isPublic()
	@ApiOperation({ summary: 'set password after email verification' })
	@HttpCode(HttpStatus.OK)
	setPassword(@Body() setPasswordInput: SetPasswordInput) {
		return this.authService.setPassword(setPasswordInput);
	}

	@Post('forgot-password')
	@isPublic()
	@ApiOperation({ summary: 'request password reset email' })
	@HttpCode(HttpStatus.OK)
	forgotPassword(@Body() forgotPasswordInput: ForgotPasswordInput) {
		return this.authService.forgotPassword(forgotPasswordInput);
	}

	@Post('reset-password')
	@isPublic()
	@ApiOperation({ summary: 'reset password using token from email' })
	@HttpCode(HttpStatus.OK)
	resetPassword(@Body() resetPasswordInput: ResetPasswordInput) {
		return this.authService.resetPassword(resetPasswordInput);
	}

	@Post('sign-in')
	@isPublic()
	@ApiOperation({ summary: 'authenticate a user using existing credentials' })
	signIn(@Body() signInInput: SignInInput) {
		return this.authService.signIn(signInInput);
	}

	@Post('refresh')
	@isPublic()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'refresh token' })
	async refreshToken(@Body('refreshToken') refreshToken: string) {
		return this.authService.refreshToken(refreshToken);
	}

}

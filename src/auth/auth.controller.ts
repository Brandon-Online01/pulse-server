import {
	Controller,
	Post,
	Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInInput, SignUpInput } from './dto/auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { isPublic } from '../decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('sign-up')
	@isPublic()
	@ApiOperation({ summary: 'Initiate the sign up process' })
	signUp(@Body() signUpInput: SignUpInput) {
		return this.authService.signUp(signUpInput);
	}

	@Post('sign-in')
	@isPublic()
	@ApiOperation({ summary: 'Authenticate a user using existing credentials' })
	signIn(@Body() signInInput: SignInInput) {
		return this.authService.signIn(signInInput);
	}

}

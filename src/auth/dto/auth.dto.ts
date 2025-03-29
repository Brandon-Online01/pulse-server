import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MinLength, Matches, IsOptional } from 'class-validator';

export class SignInInput {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'brandon',
    description: 'The username of the user',
  })
  username: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'brandon@2025',
    description: 'The password of the user',
  })
  password: string;
}

export class SignUpInput {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'brandon@loro.co.za',
    description: 'The email of the user',
  })
  email: string;
}

export class VerifyEmailInput {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'abc123',
    description: 'The verification token sent via email',
  })
  token: string;
}

export class SetPasswordInput {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'abc123',
  })
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, number/special character',
  })
  @ApiProperty({
    example: 'StrongPass123!',
    description: 'The new password for the account',
  })
  password: string;
}

export class ForgotPasswordInput {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'brandon@loro.co.za',
    description: 'The email of the user',
  })
  email: string;
}

export class ResetPasswordInput {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'abc123',
    description: 'The password reset token sent via email',
  })
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, number/special character',
  })
  @ApiProperty({
    example: 'StrongPass123!',
    description: 'The new password for the account',
  })
  password: string;
}

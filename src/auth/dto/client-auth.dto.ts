import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class ClientSignInInput {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'client@example.com',
    description: 'The email of the client',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'StrongPass123!',
    description: 'The password of the client',
  })
  password: string;
}

export class ClientForgotPasswordInput {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    example: 'client@example.com',
    description: 'The email of the client',
  })
  email: string;
}

export class ClientResetPasswordInput {
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
    description: 'The new password for the client account',
  })
  password: string;
} 
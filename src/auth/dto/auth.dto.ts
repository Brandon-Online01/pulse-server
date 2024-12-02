import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
    example: 'brandon@2024',
    description: 'The password of the user',
  })
  password: string;
}

export class SignUpInput {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'brandon@Loro.co.za',
    description: 'The email of the user',
  })
  email: string;
}

export class ForgotPasswordInput {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'brandon@Loro.co.za',
    description: 'The email of the user',
  })
  email: string;
}

export class ResetPasswordInput {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'brandon@Loro.co.za',
    description: 'The email of the user',
  })
  email: string;
}

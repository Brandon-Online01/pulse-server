import { User } from '../../user/entities/user.entity';

export type SafeUser = Omit<User, 'password'>;

export interface ProfileData {
  uid: string;
  accessLevel: string;
  name: string;
}

export interface SignInInput {
  username: string;
  password: string;
}

export interface SignInResponse {
  profileData: ProfileData;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface SignUpResponse {
  message: string;
}

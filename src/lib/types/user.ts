import { AccessLevel } from "../enums/user.enums";

export interface User {
  uid: number;
  username: string;
  password: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  photoURL: string;
  accessLevel: AccessLevel;
}

export type MultipleSearchResponse = {
  users: User[] | null;
  message: string;
};

export type SingularSearchResponse = {
  user: User | null;
  message: string;
};

export interface NewSignUp {
  email: string;
  verificationToken: string;
  status: string;
  tokenExpires: Date;
  password?: string;
}


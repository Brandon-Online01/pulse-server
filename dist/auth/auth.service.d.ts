import { SignInInput, SignUpInput } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignInResponse, SignUpResponse } from '../lib/types/auth';
import { RewardsService } from '../rewards/rewards.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class AuthService {
    private jwtService;
    private userService;
    private rewardsService;
    private eventEmitter;
    constructor(jwtService: JwtService, userService: UserService, rewardsService: RewardsService, eventEmitter: EventEmitter2);
    signIn(signInInput: SignInInput): Promise<SignInResponse>;
    signUp(signUpInput: SignUpInput): Promise<SignUpResponse>;
    private generateShortToken;
}

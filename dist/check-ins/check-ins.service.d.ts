import { CreateCheckInDto } from './dto/create-check-in.dto';
import { Repository } from 'typeorm';
import { CheckIn } from './entities/check-in.entity';
import { CreateCheckOutDto } from './dto/create-check-out.dto';
import { RewardsService } from '../rewards/rewards.service';
export declare class CheckInsService {
    private checkInRepository;
    private rewardsService;
    constructor(checkInRepository: Repository<CheckIn>, rewardsService: RewardsService);
    checkIn(createCheckInDto: CreateCheckInDto): Promise<{
        message: string;
    }>;
    checkOut(createCheckOutDto: CreateCheckOutDto): Promise<{
        message: string;
        duration?: string;
    }>;
    checkInStatus(reference: number): Promise<any>;
}

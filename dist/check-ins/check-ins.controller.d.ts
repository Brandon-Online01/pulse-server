import { CheckInsService } from './check-ins.service';
import { CreateCheckInDto } from './dto/create-check-in.dto';
import { CreateCheckOutDto } from './dto/create-check-out.dto';
export declare class CheckInsController {
    private readonly checkInsService;
    constructor(checkInsService: CheckInsService);
    checkIn(createCheckInDto: CreateCheckInDto): Promise<{
        message: string;
    }>;
    checkInStatus(reference: number): Promise<any>;
    checkOut(createCheckOutDto: CreateCheckOutDto): Promise<{
        message: string;
        duration?: string;
    }>;
}

import { RewardsService } from './rewards.service';
export declare class RewardsSubscriber {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    handleTaskCreated(payload: {
        taskId: string;
        userId: number;
    }): void;
    handleTaskCompleted(payload: {
        taskId: string;
        userId: number;
        completedEarly: boolean;
    }): void;
    handleLeadCreated(payload: {
        leadId: string;
        userId: number;
    }): void;
}

export declare class CreateRewardDto {
    owner: number;
    action: string;
    amount: number;
    source: {
        id: string;
        type: string;
        details?: any;
    };
}

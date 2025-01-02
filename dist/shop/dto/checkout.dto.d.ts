export declare class OrderItemDto {
    uid: number;
    quantity: number;
    totalPrice: number;
}
export declare class CheckoutDto {
    items: OrderItemDto[];
    client: {
        uid: number;
    };
    owner: {
        uid: number;
    };
    totalAmount: string;
    totalItems: string;
}

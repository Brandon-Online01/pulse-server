import { Product } from "src/products/entities/product.entity";
import { Order } from "./order.entity";
export declare class OrderItem {
    uid: number;
    quantity: number;
    totalPrice: number;
    product: Product;
    order: Order;
    createdAt: Date;
    updatedAt: Date;
}

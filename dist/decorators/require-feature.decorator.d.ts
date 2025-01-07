export declare const FEATURE_KEY = "features";
type ModuleFeature = `assets.${string}` | `claims.${string}` | `clients.${string}` | `communication.${string}` | `docs.${string}` | `journal.${string}` | `leads.${string}` | `licensing.${string}` | `news.${string}` | `notifications.${string}` | `organisation.${string}` | `products.${string}` | `reports.${string}` | `resellers.${string}` | `rewards.${string}` | `shop.${string}` | `tasks.${string}` | `tracking.${string}`;
export declare const RequireFeature: (...features: ModuleFeature[]) => import("@nestjs/common").CustomDecorator<string>;
export {};

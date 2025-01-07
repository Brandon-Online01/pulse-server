type ModuleName = 'assets' | 'claims' | 'clients' | 'communication' | 'docs' | 'journal' | 'leads' | 'licensing' | 'news' | 'notifications' | 'organisation' | 'products' | 'reports' | 'resellers' | 'rewards' | 'shop' | 'tasks' | 'tracking';
export declare function EnterpriseOnly(module: ModuleName): <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export {};

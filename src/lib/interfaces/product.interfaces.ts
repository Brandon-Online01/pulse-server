export interface ShopBanner {
    uid: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}
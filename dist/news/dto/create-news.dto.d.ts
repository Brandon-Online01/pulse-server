import { NewsCategory } from "../../lib/enums/news.enums";
export declare class CreateNewsDto {
    title: string;
    subtitle: string;
    content: string;
    attachments: string;
    coverImage: string;
    thumbnail: string;
    publishingDate: Date;
    author: {
        uid: number;
    };
    branch: {
        uid: number;
    };
    isDeleted: boolean;
    category: NewsCategory;
}

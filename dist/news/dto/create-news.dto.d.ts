import { NewsCategory } from "../../lib/enums/news.enums";
import { GeneralStatus } from "../../lib/enums/status.enums";
export declare class CreateNewsDto {
    title: string;
    subtitle: string;
    content: string;
    attachments: string;
    coverImage: string;
    thumbnail: string;
    publishingDate: Date;
    status: GeneralStatus;
    author: {
        uid: number;
    };
    branch: {
        uid: number;
    };
    isDeleted: boolean;
    category: NewsCategory;
}

import { CreateNewsDto } from './create-news.dto';
import { GeneralStatus } from 'src/lib/enums/status.enums';
declare const UpdateNewsDto_base: import("@nestjs/common").Type<Partial<CreateNewsDto>>;
export declare class UpdateNewsDto extends UpdateNewsDto_base {
    status: GeneralStatus;
}
export {};

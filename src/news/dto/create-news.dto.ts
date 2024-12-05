import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsObject, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Status } from "../../lib/enums/enums";

export class CreateNewsDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'News Title',
        description: 'The title of the news'
    })
    title: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'News Subtitle',
        description: 'The subtitle of the news'
    })
    subtitle: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'News Content',
        description: 'The content of the news'
    })
    content: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'https://example.com/attachments.pdf',
        description: 'The attachments of the news'
    })
    attachments: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'https://example.com/cover.png',
        description: 'The cover image of the news'
    })
    coverImage: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        example: 'https://example.com/thumbnail.png',
        description: 'The thumbnail of the news'
    })
    thumbnail: string;

    @IsDate()
    @IsNotEmpty()
    @ApiProperty({
        example: new Date(),
        description: 'The publishing date of the news'
    })
    publishingDate: Date;

    @IsEnum(Status)
    @IsNotEmpty()
    @ApiProperty({
        example: Status.ACTIVE,
        description: 'The status of the news'
    })
    status: Status;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The author reference code of the news'
    })
    author: { uid: number };

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The branch reference code of the news'
    })
    branch: { uid: number };

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        example: false,
        description: 'Deletetion status of the news'
    })
    isDeleted: boolean;
}

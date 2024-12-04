import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsDate, IsOptional, IsObject } from "class-validator";

export class CreateJournalDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'Client reference number',
        example: 'CLT123456',
    })
    clientRef: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'URL to the journal file',
        example: 'https://storage.example.com/journals/file123.pdf',
    })
    fileURL: string;

    @IsOptional()
    @IsDate()
    @ApiProperty({
        description: 'Timestamp of the journal entry',
        example: '2023-01-01T12:00:00Z',
    })
    timestamp?: Date;

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        description: 'The owner reference code of the journal',
        example: { uid: 1 },
    })
    owner: { uid: number };

    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: { uid: 1 },
        description: 'The branch reference code of the journal'
    })
    branch: { uid: number };
}

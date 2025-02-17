import { ApiProperty } from "@nestjs/swagger";
import { GeneralStatus } from '../../lib/enums/status.enums';

export class CreateBranchDto {
    @ApiProperty({
        example: 'Branch Name',
        description: 'The name of the branch'
    })
    name: string;

    @ApiProperty({
        example: 'brandon@loro.co.za',
        description: 'The email of the branch'
    })
    email: string;

    @ApiProperty({
        example: '0712345678',
        description: 'The phone number of the branch'
    })
    phone: string;

    @ApiProperty({
        example: 'https://example.com',
        description: 'The website of the branch'
    })
    website: string;

    @ApiProperty({
        example: 'Brandon N Nkawu',
        description: 'The contact person of the branch'
    })
    contactPerson: string;

    @ApiProperty({
        example: '1234567890',
        description: 'The reference code of the branch'
    })
    ref: string;

    @ApiProperty({
        example: '123 Main Street, Anytown, USA',
        description: 'The address of the branch'
    })
    address: string;

    @ApiProperty({
        example: GeneralStatus.ACTIVE,
        description: 'The status of the branch'
    })
    status: GeneralStatus;

    @ApiProperty({
        example: { uid: 1 },
        description: 'The reference code of the organisation'
    })
    organisation: { uid: number };
}

import { PartialType } from '@nestjs/swagger';
import { CreateOrganisationHoursDto } from './create-organisation-hours.dto';

export class UpdateOrganisationHoursDto extends PartialType(CreateOrganisationHoursDto) {} 
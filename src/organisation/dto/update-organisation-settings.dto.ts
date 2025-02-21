import { PartialType } from '@nestjs/swagger';
import { CreateOrganisationSettingsDto } from './create-organisation-settings.dto';

export class UpdateOrganisationSettingsDto extends PartialType(CreateOrganisationSettingsDto) {} 
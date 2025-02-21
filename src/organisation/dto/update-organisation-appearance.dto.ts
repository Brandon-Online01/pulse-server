import { PartialType } from '@nestjs/swagger';
import { CreateOrganisationAppearanceDto } from './create-organisation-appearance.dto';

export class UpdateOrganisationAppearanceDto extends PartialType(CreateOrganisationAppearanceDto) {} 
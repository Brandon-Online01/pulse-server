import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/role.decorator';
import { AccessLevel } from 'src/lib/enums/enums';


@ApiTags('claims')
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'create a new claim' })
  create(@Body() createClaimDto: CreateClaimDto) {
    return this.claimsService.create(createClaimDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'get all claims' })
  findAll() {
    return this.claimsService.findAll();
  }

  @Get(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'get a claim by reference code' })
  findOne(@Param('referenceCode') referenceCode: number) {
    return this.claimsService.findOne(referenceCode);
  }

  @Patch(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'update a claim' })
  update(@Param('referenceCode') referenceCode: number, @Body() updateClaimDto: UpdateClaimDto) {
    return this.claimsService.update(referenceCode, updateClaimDto);
  }

  @Patch('restore/:referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'restore a claim' })
  restore(@Param('referenceCode') referenceCode: number) {
    return this.claimsService.restore(referenceCode);
  }

  @Delete(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER)
  @ApiOperation({ summary: 'soft delete a claim' })
  remove(@Param('referenceCode') referenceCode: number) {
    return this.claimsService.remove(referenceCode);
  }
}

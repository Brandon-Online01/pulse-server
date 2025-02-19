import { DocsService } from './docs.service';
import { CreateDocDto } from './dto/create-doc.dto';
import { UpdateDocDto } from './dto/update-doc.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, NotFoundException, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { isPublic } from '../decorators/public.decorator';
import { extname } from 'path';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/user.enums';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';
import { EnterpriseOnly } from '../decorators/enterprise-only.decorator';

@ApiTags('docs')
@Controller('docs')
@UseGuards(AuthGuard, RoleGuard)
@EnterpriseOnly('claims')
export class DocsController {
  constructor(private readonly docsService: DocsService) { }

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @isPublic()
  @ApiOperation({ summary: 'create a new document' })
  create(@Body() createDocDto: CreateDocDto) {
    return this.docsService.create(createDocDto);
  }

  //file upload
  @Post('/upload')
  @isPublic()
  @ApiOperation({ summary: 'upload an file to a storage bucket in google cloud storage' })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname) {
          return cb(new NotFoundException('No file name provided'), false);
        }

        const allowedExtensions = ['.png', '.jpg', '.jpeg', 'webp', '.gif', 'mp4'];
        const ext = extname(file?.originalname)?.toLowerCase();

        if (!allowedExtensions?.includes(ext)) {
          return cb(
            new BadRequestException(
              'Invalid file type. Only PNG, JPG, GIF, MP4, and JPEG files are allowed.',
            ),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async uploadToBucket(@UploadedFile() file: Express.Multer.File) {
    return this.docsService.uploadToBucket(file);
  }

  @Post('/remove/:ref')
  @isPublic()
  @ApiOperation({ summary: 'soft delete an file from a storage bucket in google cloud storage' })
  async deleteFromBucket(@Param('ref') ref: string) {
    return this.docsService.deleteFromBucket(ref);
  }

  async getExtension(filename: string) {
    const parts = filename?.split('.');
    return parts?.length === 1 ? '' : parts[parts?.length - 1];
  }

  @Get()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get all documents' })
  findAll() {
    return this.docsService.findAll();
  }

  @Get(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a document by reference code' })
  findOne(@Param('ref') ref: number) {
    return this.docsService.findOne(ref);
  }

  @Get('for/:ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get documents by user reference code' })
  docsByUser(@Param('ref') ref: number) {
    return this.docsService.docsByUser(ref);
  }

  @Patch(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a document by reference code' })
  update(@Param('ref') ref: number, @Body() updateDocDto: UpdateDocDto) {
    return this.docsService.update(ref, updateDocDto);
  }

  @Delete(':ref')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a document by reference code' })
  remove(@Param('ref') ref: number) {
    return this.docsService.remove(ref);
  }
}

import { DocsService } from './docs.service';
import { CreateDocDto } from './dto/create-doc.dto';
import { UpdateDocDto } from './dto/update-doc.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, NotFoundException, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { isPublic } from '../decorators/public.decorator';
import { extname } from 'path';
import { Roles } from '../decorators/role.decorator';
import { AccessLevel } from '../lib/enums/enums';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('docs')
@Controller('docs')
@UseGuards(RoleGuard, AuthGuard)
export class DocsController {
  constructor(private readonly docsService: DocsService) { }

  @Post()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'create a new document' })
  create(@Body() createDocDto: CreateDocDto) {
    return this.docsService.create(createDocDto);
  }

  @Get()
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get all documents' })
  findAll() {
    return this.docsService.findAll();
  }

  @Get(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'get a document by reference code' })
  findOne(@Param('referenceCode') referenceCode: number) {
    return this.docsService.findOne(referenceCode);
  }

  @Patch(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'update a document by reference code' })
  update(@Param('referenceCode') referenceCode: number, @Body() updateDocDto: UpdateDocDto) {
    return this.docsService.update(referenceCode, updateDocDto);
  }

  @Delete(':referenceCode')
  @Roles(AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.USER)
  @ApiOperation({ summary: 'soft delete a document by reference code' })
  remove(@Param('referenceCode') referenceCode: number) {
    return this.docsService.remove(referenceCode);
  }


  //file upload
  @Post('/upload-file')
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

  @Post('/remove-file/:referenceCode')
  @isPublic()
  @ApiOperation({ summary: 'soft delete an file from a storage bucket in google cloud storage' })
  async deleteFromBucket(@Param('referenceCode') referenceCode: string) {
    return this.docsService.deleteFromBucket(referenceCode);
  }

  async getExtension(filename: string) {
    const parts = filename?.split('.');
    return parts?.length === 1 ? '' : parts[parts?.length - 1];
  }
}

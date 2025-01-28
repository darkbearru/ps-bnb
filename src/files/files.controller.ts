import {
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/auth-roles.decorator';
import { UserRole } from '../users/users.roles';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileElementResponse } from './dto/file-element.response';
import { FILE_3_MB } from './files.constants';

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@UseGuards(AccessTokenGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	@HttpCode(HttpStatus.OK)
	@Post('upload')
	@UseInterceptors(FileInterceptor('files', { limits: { fileSize: FILE_3_MB } }))
	async upload(@UploadedFile() file: Express.Multer.File): Promise<FileElementResponse[]> {
		return this.filesService.uploadAndResize(file);
	}
}

import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { FileElementResponse } from './dto/file-element.response';
import { format } from 'date-fns';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import { MulterFile } from './MulterFile.class';
import { FILE_CONVERT_ERROR, FILE_FILE_FORMAT_ERROR } from './files.constants';
import * as sharp from 'sharp';

@Injectable()
export class FilesService {
	async uploadAndResize(file: Express.Multer.File): Promise<FileElementResponse[] | undefined> {
		const saveArray: MulterFile[] = [];

		if (!this.checkFormat(file)) {
			throw new BadRequestException(FILE_FILE_FORMAT_ERROR);
		}

		try {
			saveArray.push(
				new MulterFile({
					originalname: this.swapExtension(file.originalname, 'webp'),
					buffer: await this.convertAndResize(file.buffer),
				}),
			);
		} catch (error) {
			console.log(error);
			throw new InternalServerErrorException(FILE_CONVERT_ERROR);
		}

		return this.upload(saveArray);
	}

	private async upload(files: MulterFile[]): Promise<FileElementResponse[]> {
		const dateFolder = format(new Date(), 'yyyy-MM-dd');
		const uploadFolder = `${path}/uploads/${dateFolder}`;
		await ensureDir(uploadFolder);
		const response: FileElementResponse[] = [];
		for (const file of files) {
			await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer);
			response.push({
				url: `${dateFolder}/${file.originalname}`,
				name: file.originalname,
			});
		}
		return response;
	}

	private checkFormat(file: Express.Multer.File): boolean {
		return file.mimetype.includes('image');
	}

	private swapExtension(fileName: string, newExtension: string): string {
		const position = fileName.lastIndexOf('.');
		fileName = fileName.substring(0, position < 0 ? fileName.length : position);
		return `${fileName}.${newExtension}`;
	}

	private async convertAndResize(file: Buffer): Promise<Buffer> {
		return sharp(file)
			.resize({ width: 500, withoutEnlargement: true, fit: 'cover' })
			.webp()
			.toBuffer();
	}
}

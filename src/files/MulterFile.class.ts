export class MulterFile {
	originalname: string;
	buffer: Buffer;

	constructor(file: Express.Multer.File | MulterFile) {
		this.buffer = file.buffer;
		this.originalname = file.originalname;
	}
}

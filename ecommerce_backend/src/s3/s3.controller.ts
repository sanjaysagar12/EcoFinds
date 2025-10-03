import { Controller, Post, Get, UseInterceptors, UploadedFile, BadRequestException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
	constructor(private readonly s3Service: S3Service) {}

	@Post('image')
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(@UploadedFile() file: any) {
		if (!file) {
			throw new BadRequestException('No file uploaded');
		}

		// Basic file validation
		const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException('Only image files are allowed');
		}

		// File size limit (5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSize) {
			throw new BadRequestException('File size must be less than 5MB');
		}

		try {
			const imageUrl = await this.s3Service.uploadFile(file, 'images');
			return {
				status: 'success',
				message: 'Image uploaded successfully',
				data: {
					imageUrl: imageUrl,
					fileName: file.originalname,
					fileSize: file.size,
					mimeType: file.mimetype
				}
			};
		} catch (error) {
			throw new BadRequestException('Failed to upload image');
		}
	}

	@Get('images/:fileName')
	async getImage(@Param('fileName') fileName: string, @Res() res: Response) {
		try {
			// Check if file exists in MinIO
			const exists = await this.s3Service.fileExists('images', fileName);
			if (!exists) {
				return res.status(404).json({ message: 'Image not found' });
			}

			// Get the file buffer from MinIO
			const fileBuffer = await this.s3Service.getFile('images', fileName);

			// Set appropriate headers
			res.set({
				'Content-Type': 'image/*',
				'Content-Disposition': `inline; filename=${fileName}`,
			});

			// Send the file buffer
			res.send(fileBuffer);
		} catch (error) {
			return res.status(404).json({ message: 'Image not found' });
		}
	}
}

import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
	private s3Client: S3Client;
	private bucketName: string;

	constructor() {
		this.bucketName = process.env.MINIO_BUCKET_NAME || 'minio-bucket';
		this.s3Client = new S3Client({
			region: process.env.MINIO_REGION_NAME || 'us-east-1',
			endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
			credentials: {
				accessKeyId: process.env.MINIO_ROOT_USER || 'minioadmin',
				secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
			},
			forcePathStyle: true,
		});
	}

	async uploadFile(file: any, folder = 'images'): Promise<string> {
		try {
			const timestamp = Date.now();
			const fileExtension = file.originalname.split('.').pop();
			const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
			const key = `${folder}/${fileName}`;

			const command = new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
				ACL: 'public-read',
			});

			await this.s3Client.send(command);

			// Return the API endpoint URL format
			const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
			return `${baseUrl}/s3/images/${fileName}`;
		} catch (error) {
			throw new Error('Failed to upload file');
		}
	}

	async getFile(folder: string, fileName: string): Promise<Buffer> {
		try {
			const key = `${folder}/${fileName}`;
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});
			const response = await this.s3Client.send(command);
			if (!response.Body) {
				throw new Error('File not found');
			}
			// Node.js stream to buffer
			const chunks: Uint8Array[] = [];
			for await (const chunk of response.Body as any) {
				chunks.push(chunk);
			}
			return Buffer.concat(chunks);
		} catch (error) {
			throw new Error('Failed to read file');
		}
	}

	async fileExists(folder: string, fileName: string): Promise<boolean> {
		try {
			const key = `${folder}/${fileName}`;
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});
			await this.s3Client.send(command);
			return true;
		} catch (error) {
			return false;
		}
	}
}

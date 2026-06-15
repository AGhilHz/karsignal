import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      endpoint: config.get('S3_ENDPOINT'),
      region: config.get('S3_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: config.get('S3_SECRET_KEY', 'minioadmin'),
      },
      forcePathStyle: true, // required for MinIO
    });
    this.bucket = config.get('S3_BUCKET_NAME', 'career-platform');
    this.publicUrl = config.get('S3_PUBLIC_URL', 'http://localhost:9000/career-platform');
  }

  async uploadImage(
    buffer: Buffer,
    folder: string,
    options: { width?: number; height?: number; quality?: number } = {},
  ): Promise<string> {
    // Resize and optimize image
    const processed = await sharp(buffer)
      .resize(options.width || 800, options.height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: options.quality || 85 })
      .toBuffer();

    const key = `${folder}/${uuidv4()}.webp`;

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: processed,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000',
    }));

    return `${this.publicUrl}/${key}`;
  }

  async uploadFile(buffer: Buffer, folder: string, filename: string, contentType: string): Promise<string> {
    const ext = filename.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    return `${this.publicUrl}/${key}`;
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.s3, command, { expiresIn });
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.replace(`${this.publicUrl}/`, '');
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error);
    }
  }
}

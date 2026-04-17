import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  constructor(private readonly supabaseService: SupabaseService) { }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    const supabase = this.supabaseService.getClient();
    const bucketName = 'images';
    const fileExt = path.extname(file.originalname) || '.png';
    const filePath = `editor/${Date.now()}-${randomUUID()}${fileExt}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Image Upload Failed: ${error.message}`);
      throw new InternalServerErrorException('Image Upload Failed. Please try again later.');
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: data.publicUrl };
  }
}

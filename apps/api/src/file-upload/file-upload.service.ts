import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  constructor(private supabaseService: SupabaseService) { }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const supabase = this.supabaseService.getClient();
    const bucketName = 'images';

    // Generate unique filename: editor/{uuid}.{ext}
    const fileExt = path.extname(file.originalname) || '.png';
    const filePath = `editor/${randomUUID()}${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new InternalServerErrorException(error.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: publicUrl };
  }
}

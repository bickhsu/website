import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileUploadController } from './file-upload.controller';

@Module({
  providers: [UploadService],
  controllers: [FileUploadController]
})
export class UploadModule {}

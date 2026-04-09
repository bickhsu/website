import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { FrameModule } from './frame/frame.module';
import { KeyframeModule } from './keyframe/keyframe.module';
import { SequenceModule } from './sequence/sequence.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(process.cwd(), '../../.env'),
    }),
    PrismaModule,
    SequenceModule,
    FrameModule,
    KeyframeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

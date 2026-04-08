import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { FragmentModule } from './fragment/fragment.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(process.cwd(), '../../.env'),
    }),
    PrismaModule,
    FragmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

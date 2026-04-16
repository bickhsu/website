import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateSequenceDto } from './create-sequence.dto';
import { StatusEnum } from '@prisma-client';

export class UpdateSequenceDto extends PartialType(CreateSequenceDto) {
    @IsEnum(StatusEnum)
    @IsOptional()
    status?: StatusEnum = StatusEnum.ACTIVE;
}

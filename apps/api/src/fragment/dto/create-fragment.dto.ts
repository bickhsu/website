import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { DomainEnum } from '@prisma/client';

export class CreateFragmentDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    hook?: string;

    @IsEnum(DomainEnum)
    @IsOptional()
    domain?: DomainEnum = DomainEnum.General;

    @IsUUID()
    @IsOptional()
    linked_execution_id?: string;
}

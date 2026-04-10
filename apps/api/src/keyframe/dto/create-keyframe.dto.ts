import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { DomainEnum } from '../../../generated/prisma';

export class CreateKeyframeDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    hook?: string;

    @IsEnum(DomainEnum)
    @IsOptional()
    domain?: DomainEnum = DomainEnum.GENERAL;
}

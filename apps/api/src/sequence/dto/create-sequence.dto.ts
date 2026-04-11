import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { DomainEnum } from '../../../generated/prisma';

export class CreateSequenceDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsEnum(DomainEnum)
    @IsOptional()
    domain?: DomainEnum = DomainEnum.GENERAL;

    @IsString()
    @IsOptional()
    problemStatement?: string;

    @IsString()
    @IsOptional()
    valueDelivered?: string;
}

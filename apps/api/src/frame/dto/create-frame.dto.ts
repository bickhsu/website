import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFrameDto {
    @IsString()
    @IsNotEmpty()
    content: string;
}

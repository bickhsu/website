import { PartialType } from '@nestjs/mapped-types';
import { CreateFragmentDto } from './create-sequence.dto';

export class UpdateFragmentDto extends PartialType(CreateFragmentDto) { }

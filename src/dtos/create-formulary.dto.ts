import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateFormularyDto {
  @ApiProperty({
    description: 'The name of the formulary',
    example: 'Pain Relief Formulary',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A brief description of the formulary (optional)',
    example: 'Formulary for pain relief medications',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The business unit ID associated with the formulary',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsUUID()
  business_unit_id: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateFormularyDto {
  @ApiProperty({
    description: 'The name of the formulary (optional)',
    example: 'Updated Pain Relief Formulary',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'A brief description of the formulary (optional)',
    example: 'Updated formulary for pain relief medications',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The business unit ID associated with the formulary (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    type: String,
  })
  @IsUUID()
  @IsOptional()
  business_unit_id?: string;
}

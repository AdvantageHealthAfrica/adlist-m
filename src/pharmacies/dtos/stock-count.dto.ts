import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, IsNotEmpty } from 'class-validator';

export class StockCountDto {
  @ApiProperty({ description: 'Pharmacy Product ID' })
  @IsUUID()
  @IsNotEmpty()
  product: string;

  @ApiProperty({ description: 'Counted quantity' })
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'User ID of the person counting' })
  @IsUUID()
  @IsNotEmpty()
  countedBy: string;

  @ApiPropertyOptional({ description: 'Business Unit ID' })
  @IsInt()
  businessUnit?: number;

  @ApiPropertyOptional({ description: 'Additional comments' })
  @IsString()
  comments?: string;
}

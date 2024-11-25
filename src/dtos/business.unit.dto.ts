import { ApiProperty } from '@nestjs/swagger';

export class BusinessUnitDto {
  @ApiProperty()
  bu_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

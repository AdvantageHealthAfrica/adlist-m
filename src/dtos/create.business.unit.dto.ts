import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";


export class CreateBusinessUnitDto {
  @ApiProperty({description: 'Name of the business unit', example: "TestUnit"})
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({description: 'Location of the business unit', example: "Lagos, Nigeria"})
  @IsString()
  @IsNotEmpty()
  location: string;
}

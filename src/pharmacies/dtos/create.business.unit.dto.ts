import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBusinessUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}

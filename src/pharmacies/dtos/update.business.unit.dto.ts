import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateBusinessUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;
}

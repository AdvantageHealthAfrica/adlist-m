import { IsString, IsNotEmpty, IsOptional, IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePharmOutletDto{
  @ApiProperty({description: "Name of pharmacy being enrolled to stock taking.", example: "Victoria Drugs store"})
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({description: "Phone number attached to pharmacy", example: "08011223344"})
  @IsString()
  @IsOptional()
  phoneNumber: string
  
  @ApiProperty({ description: "The email address that can be used to reach out to the pharmacist that owns the pharmacy. This must be of the same value with email address of the pharmacist." })
  @IsEmail()
  @IsNotEmpty()
  emailAddress: string

  @ApiProperty({ description: "The location of the pharmacy." })
  @IsString()
  @IsNotEmpty()
  location: string

}
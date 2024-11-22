import { IsNumber, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyResetTokenDto{
  @ApiProperty({description: "Verification token.", example: 123456})
  @IsNotEmpty()
  @IsNumber()
  token: number
}
import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordDto{
  @ApiProperty({description: "User's email address for password reset verification", example: "testemail@email.com"})
  @IsString()
  @IsNotEmpty()
  email: string
}
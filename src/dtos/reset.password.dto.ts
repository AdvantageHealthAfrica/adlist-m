import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ResetPasswordDto{
  @ApiProperty({description: 'New password after success token verification', example: "new_password123"})
  @IsNotEmpty()
  @IsString()
  newPassword: string
}
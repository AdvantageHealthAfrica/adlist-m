import { IsString, IsStrongPassword, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto{

  @ApiProperty({
    description: 'The existing password of the user.',
    example: "old_password124"
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string

  @ApiProperty({
    description: 'The new password that the user wants to change to.',
    example: "new_password123*"
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string
  
  @ApiProperty({
    description: 'The confirmation password field. This must be equal with the newPassword field value.',
    example: "new_password123*"
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  confirmPassword: string
}
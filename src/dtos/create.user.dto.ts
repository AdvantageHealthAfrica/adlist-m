import { IsEmail, IsStrongPassword, IsOptional, IsNotEmpty, IsEnum } from "class-validator";
import { Role } from "../enums/role.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto{

  @ApiProperty({
    description: 'The email address of the user being registered on the app',
    example: 'testadmin@gmail.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'The password of the user being registered on the app.',
    example: 'Testpass123*'
  })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string

  @ApiProperty({
    description: 'Optional role to be specified for the user being registered. Role options are "Admin", "Agent" and "Pharmacist". When no role is specified, user is automatically registered as an Admin.',
    example: 'User'
  })
  @IsOptional()
  @IsEnum(Role)
  role: Role
}
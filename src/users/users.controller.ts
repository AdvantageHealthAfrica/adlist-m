import { Controller, Post, Body,  } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create.user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService
  ) { }
  
  // @Post()
  // async createUser(@Body() userData: CreateUserDto) {
  //   return await this.usersService.createUser(userData.email, userData.password, userData.role)
  // }
}

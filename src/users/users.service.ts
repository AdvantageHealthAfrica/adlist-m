import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../enums/role.enum';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>
  ) { }
  
  async createUser(email: string, password: string, role?: Role) {
    let existingUser = await this.userRepo.findOneBy({ email })
    if (existingUser) {
      throw new HttpException("A user with this email address already exists.", HttpStatus.BAD_REQUEST)
    }
    const user = this.userRepo.create({ email, password, role })
    return this.userRepo.save(user)
  }

  async getUserByEmail(email: string) {
    let user = await this.userRepo.findOneBy({ email })
    if (!user) {
      throw new HttpException("User with this email address does not exist.", HttpStatus.BAD_REQUEST)
    }
    return user
  }

  // this function is used by the passport-jwt strategy
  async getUserByIdAndEmail(id: number, email: string) {
    const user = await this.userRepo.findOneBy({ id, email })
    if (!user) {
      throw new HttpException("User does not exist", HttpStatus.BAD_REQUEST)
    }
    return user
  }

  async changePassword(email: string, newPassword: string) {
    const user = await this.userRepo.findOneBy({ email })
    user.password = newPassword
    this.userRepo.save(user)
    return user
  }
}

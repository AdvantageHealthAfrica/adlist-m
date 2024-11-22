import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../enums/role.enum';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { ResetTokenGenerator } from '../utils/generate.reset.token';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordReset } from './password.reset.entity';
import { NodeMailerSendEMail } from '../utils/send.email';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(PasswordReset) private passwordResetRepo: Repository<PasswordReset>
  ) { }


  async registerUser(email: string, password: string, role?:Role) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    return await this.usersService.createUser(email, hashedPassword, role)
  }

  // this function will be used by the Passport-Local strategy
  async getValidatedUser(email: string, inputtedPassword: string) {
    const user = await this.usersService.getUserByEmail(email)
    let hashedPassword = user.password
    const validPassword = await bcrypt.compare(inputtedPassword, hashedPassword)
    if (!validPassword) {
      throw new HttpException("Invalid Credentials", HttpStatus.BAD_REQUEST)
    }
    return user
  }


  async createJwtAccessToken(userId: number, email: string) {
    const payload = { userId, email }
    const token = this.jwtService.sign(payload)
    return token
  }


  async changePassword(user: User, oldPassword: string, newPassword: string, confirmPassword: string) {
    let existingUser = await this.usersService.getUserByEmail(user.email)
    if (!existingUser) {
      throw new HttpException("User does not exist.", HttpStatus.BAD_REQUEST)
    }

    let hashedPassword = existingUser.password
    const validOldPassword = await bcrypt.compare(oldPassword, hashedPassword)
    if (!validOldPassword) {
      throw new HttpException("Invalid Credentials.", HttpStatus.BAD_REQUEST)
    }
    else if (newPassword !== confirmPassword) {
      throw new HttpException("The passwords you entered do not match. Please make sure both password fields contain the same password.", HttpStatus.BAD_REQUEST)
    }
    else if (oldPassword == newPassword) {
      throw new HttpException("The new password cannot be the same as your previous password. Please choose a different password.", HttpStatus.BAD_REQUEST)
    }

    const salt = await bcrypt.genSalt(10) 
    const newHashedPassword = await bcrypt.hash(confirmPassword, salt)
    existingUser = await this.usersService.changePassword(user.email, newHashedPassword)
    return {
      "message": "Password changed.",
      "user": existingUser
    }
  }


  async forgotPassword(userEmailAddress: string) {
    const user = await this.usersService.getUserByEmail(userEmailAddress)
    if (!user) {
      throw new HttpException("Invalid request: User does not exist", HttpStatus.BAD_REQUEST)
    }
    const resetTokenGenerator = new ResetTokenGenerator()
    const token = resetTokenGenerator.generateRandomNumericToken(6)

    const currentDate = new Date()
    const expiry_time = new Date(currentDate.getTime() + 10 * 60000); // setting token expiry time to 10 minutes from current time

    const existingToken = await this.passwordResetRepo.findOneBy({ email: userEmailAddress })
    if (existingToken) {
      await this.passwordResetRepo.delete(existingToken)
    }

    let resetToken = this.passwordResetRepo.create({ email: userEmailAddress, token: token, expiry_time: expiry_time })
    resetToken = await this.passwordResetRepo.save(resetToken)
    const nodeMailerSendEmail = new NodeMailerSendEMail()
    await nodeMailerSendEmail.sendPasswordResetToken(userEmailAddress, token)
    
    return {
      message: "Password reset token sent. Check your email.",
    }
  }


  async verifyResetToken(token: number) {
    const resetToken = await this.passwordResetRepo.findOneBy({ token })

    if (!resetToken) {
      throw new HttpException("Invalid token, please request for a new token.", HttpStatus.BAD_REQUEST)
    }

    let tokenExpiryTime = resetToken.expiry_time
    tokenExpiryTime = new Date(tokenExpiryTime)
    let tokenExpiryEpochTime = tokenExpiryTime.getTime()

    const currentEpochTime = new Date().valueOf()  // current time in milliseconds
    console.log("current epoch time: ", currentEpochTime)

    console.log("token epoch time: ", tokenExpiryEpochTime)

    if (tokenExpiryEpochTime > currentEpochTime) {
      return {
        message: "Token verified successfully"
      }
    }

    else {
      await this.passwordResetRepo.delete(resetToken)
      throw new HttpException("Invalid token, please request for a new token.", HttpStatus.BAD_REQUEST)
    }
  }


  async resetPassword(token: number, newPassword: string) {
    const resetToken = await this.passwordResetRepo.findOneBy({ token })
    if (!resetToken) {
      throw new HttpException("Invalid token, please request for a new token.", HttpStatus.BAD_REQUEST)
    }

    const user = await this.usersService.getUserByEmail(resetToken.email)
    if (!user) {
      throw new HttpException("User does not exist.", HttpStatus.BAD_REQUEST)
    }
    const salt = await bcrypt.genSalt(10)
    const newHashedPassword = await bcrypt.hash(newPassword, salt)
    await this.usersService.changePassword(user.email, newHashedPassword)
    await this.passwordResetRepo.delete(resetToken)


    return {
      message: "Password reset successful"
    }
  }
}

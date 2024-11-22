import { Controller, Post, Body, UseGuards, Request, Response, Get, Redirect, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dtos/create.user.dto';
import { ChangePasswordDto } from '../dtos/change.password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ForgotPasswordDto } from '../dtos/forgot.password.dto';
import { VerifyResetTokenDto } from '../dtos/verify.token.dto';
import { ResetPasswordDto } from 'src/dtos/reset.password.dto';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PharmaciesService } from '../pharmacies/services/pharmacies.service';
import { Role } from 'src/enums/role.enum';



@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private pharmService: PharmaciesService
  ) { }
  
  // adding random prefix-string (zxpbn) to hide access to the registration process in the browser search bar from agents
  @ApiOperation({ summary: "Registers both admin and agents on the AdList. This will be carried out by TheAdvantage admins only. Roles are 'User' and 'Admin'. If a role is not specified during registration, the account is created as an Admin by default. " })
  @ApiBody({type: CreateUserDto})
  @Post('zxpbn-register')
  async registerUser(@Body() body: CreateUserDto) {
    return await this.authService.registerUser(body.email, body.password, body.role)
  }

  @ApiOperation({ summary: "Request body for authentication login." })
  @ApiBody({description: "{email:email_address, password:password} "})
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async loginUser(@Request() request, @Response() response) {
    const user = request.user
    const token = await this.authService.createJwtAccessToken(user.id, user.email)
    if (user.role == Role.Pharmacist) {
      const assignedPharmacy = await this.pharmService.getAssignedPharmacyByEmail(user.email)
      return response.send({
        user: user,
        accessToken: token,
        assignedPharmacy: assignedPharmacy
      });
    }
    // response.setHeader("Set-Cookie", `access_token=${token}; HttpOnly`)
    // return response.send(user)
    return response.send({
      user: user,
      accessToken: token
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "This fetches the profile of the current logged in user. This can be used to check their role status." })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() request) {
    return request.user
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Change password action for logged in user. The can be utilized after agents have gotten their credentials from the admin." })
  @ApiBody({type: ChangePasswordDto})
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() request, @Body() body: ChangePasswordDto) {
    const user = request.user
    return await this.authService.changePassword(user, body.oldPassword, body.newPassword, body.confirmPassword)
  }


  @ApiOperation({ summary: "With this endpoint, the user provides their email address with which they will receive a reset password token for password reset." })
  @ApiBody({type: ForgotPasswordDto})
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.forgotPassword(body.email)
  }

  @ApiOperation({ summary: "After user receives the reset password token, it is provided to this endpoint for verification" })
  @ApiBody({type: VerifyResetTokenDto})
  @Post('verify-token')
  async verifyResetToken(@Body() body: VerifyResetTokenDto) {
    return await this.authService.verifyResetToken(body.token)
  }

  @ApiOperation({ summary: "After token is verified, it is used to enable the user input their new password" })
  @ApiQuery({name: "token", description: "verification token", required:true})
  @ApiBody({type: ResetPasswordDto})
  @Post('reset-password')
  async resetPassword(@Query('token') token: number, @Body() body: ResetPasswordDto) {
    return await this.authService.resetPassword(token, body.newPassword)
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { get } from 'http';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorators';
import { RawHeaders } from './decorators/raw-headers.decorators';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('/login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('/check-status')
  @Auth(ValidRoles.user)
  checkAuthStatus(
    @GetUser() user:User
  ){
    return this.authService.checkAuthStatus(user)
  }


  @Get('/private')
  @UseGuards(AuthGuard('jwt'))
  testPrivateRoute(
    // @Req() req: Request, @Res() res: Response
    // @RawHeaders() raw:string[]
    @GetUser() user: User,
    @GetUser('email') email: string,
  ) {
    // const user = req.user;
    // return res.status(200).json({ user });
    return { user, email };
  }

  // protect route WITH ROLES//

  @Get('/private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AuthGuard('jwt'), UserRoleGuard)
  testPrivateRoute2(@GetUser() user: User, @GetUser('email') email: string) {
    return { user, email };
  }

  // decorator auth.
  @Get('/private3')
  @Auth(ValidRoles.admin , ValidRoles.user)
  testPrivateRoute3(@GetUser() user: User) {
    return { user };
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.inteface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRespository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    try {
      const user = this.userRespository.create({ ...userData, password: hash });
      await this.userRespository.save(user);

      return {
        message: 'created',
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (err) {
      this.handleDBErrors(err);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRespository.findOne({
      where: { email },
      select: { email: true, id: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException(
        `Credentials are not valid:"email" does not exist`,
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(`The password is incorrect.`);
    }
    return { token: this.getJwtToken({ id: user.id }) };
  }

  async checkAuthStatus(user: User) {
    return { ...user , token: this.getJwtToken({ id: user.id }) };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(err: any): never {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }
    console.log(err);
    throw new InternalServerErrorException('Please check server logs');
  }
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly SALT_JWT = 10;
  constructor(
    @InjectRepository(User) private readonly userRepositoty: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userDate } = createUserDto;

      const user = this.userRepositoty.create({
        ...userDate,
        password: bcrypt.hashSync(password, this.SALT_JWT),
      });

      await this.userRepositoty.save(user);
      delete user.password;

      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(error.detail);
      }
      throw new InternalServerErrorException('please check server logs');
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepositoty.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials - pass');
    }

    return { ...user, token: this.getJwtToken({ id: user.id }) };
  }

  checkStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}

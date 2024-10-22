import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { hash, compare } from 'bcryptjs';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const candidate: User | null = await this.userService.findOneUserByEmail(
      dto.email,
    );

    if (candidate) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword: string = await hash(dto.password, 3);
    const user: User = await this.userService.create({
      email: dto.email,
      password: hashedPassword,
    });

    return await this.generateToken(user.id, user.email);
  }

  async login(dto: CreateUserDto) {
    const candidate: User | null = await this.userService.findOneUserByEmail(
      dto.email,
    );

    if (!candidate) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { email, password: hashedPassword } = candidate;

    if (dto.email !== email) {
      throw new HttpException(
        'Email or password are incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }
    const isPasswordValid: boolean = await compare(
      dto.password,
      hashedPassword,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        'Email or password are incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.generateToken(candidate.id, candidate.email);
  }

  private async generateToken(id: number, email: string) {
    return {
      accessToken: await this.jwtService.signAsync({ id, email }),
    };
  }
}

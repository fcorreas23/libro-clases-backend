import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private buildUserPayload(user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    teacher: { id: number } | null;
    roles: Array<{ role: { name: string } }>;
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      teacherId: user.teacher?.id ?? null,
      roles: user.roles.map((item) => item.role.name),
    };
  }

  private signAccessToken(user: ReturnType<AuthService['buildUserPayload']>) {
    const payload: AuthenticatedUser = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      teacherId: user.teacherId,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET ?? 'libro-clases-dev-secret',
      expiresIn: '8h',
    });
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: {
        teacher: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const isValidPassword = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const safeUser = this.buildUserPayload(user);

    return {
      accessToken: this.signAccessToken(safeUser),
      user: safeUser,
    };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacher: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }

    return this.buildUserPayload(user);
  }
}

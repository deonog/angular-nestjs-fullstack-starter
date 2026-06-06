import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { AppConfigService } from '../../config/app-config.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser, JwtPayload, RefreshJwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class AuthService {
  private readonly saltRounds = 12;

  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(AppConfigService) private readonly config: AppConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);
    const user = await this.usersService.create(dto.email, passwordHash);
    return this.issueTokenPair(user.id, user.email);
  }

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokenPair(user.id, user.email);
  }

  async refresh(refreshToken: string): Promise<TokenResponseDto> {
    let payload: RefreshJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshJwtPayload>(refreshToken, {
        secret: this.config.jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.userId !== payload.sub || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokenPair(stored.user.id, stored.user.email);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { id: user.id, email: user.email };
  }

  validateAccessPayload(payload: JwtPayload): AuthenticatedUser {
    return { userId: payload.sub, email: payload.email };
  }

  private async issueTokenPair(userId: string, email: string): Promise<TokenResponseDto> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email } satisfies JwtPayload,
      {
        secret: this.config.jwtAccessSecret,
        expiresIn: this.config.jwtAccessExpires as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );

    const jti = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, jti } satisfies RefreshJwtPayload,
      {
        secret: this.config.jwtRefreshSecret,
        expiresIn: this.config.jwtRefreshExpires as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );

    const expiresAt = this.getRefreshExpiryDate();
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshExpiryDate(): Date {
    const expiresIn = this.config.jwtRefreshExpires;
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}

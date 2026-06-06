import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findRefreshTokenByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  deleteRefreshToken(id: string) {
    return this.prisma.refreshToken.delete({ where: { id } });
  }

  deleteRefreshTokensByHash(tokenHash: string) {
    return this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  createRefreshToken(data: { tokenHash: string; userId: string; expiresAt: Date }) {
    return this.prisma.refreshToken.create({ data });
  }
}

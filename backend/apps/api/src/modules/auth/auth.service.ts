import {
    PrismaService,
} from '@app/db';
import { Injectable } from '@nestjs/common';
import { TokenPayload } from './dto/auth.model';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    private async signJwtToken(params: { user: { id: number } }) {
        const { user } = params;

        const payload: TokenPayload = { id: user.id };

        const token = await this.jwtService.signAsync(payload, {
            secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        });

        return { token };
    }
}

import {
    BaseError,
    CoreConfigService,
    isError,
    PrivyPayloadType,
    PrivyService,
    UnauthorizedError,
    UserNotFound,
} from '@app/core';
import { PrismaService, PrismaTransaction, TransactionIsolationLevel } from '@app/prisma';
import { UserId } from '@app/prisma/models/user.model';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User as PrivyUser } from '@privy-io/server-auth';
import { ConfigModel } from '../../config/config.model';
import { ReferralService } from '../referral/referral.service';
import { UserService } from '../user/user.service';
import { SignInDto, SignInPrivyDto, SignInResponseDto } from './dto/auth.dto';
import { TokenPayload } from './dto/auth.model';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly privy: PrivyService,
        private readonly userService: UserService,
        private readonly referralService: ReferralService,
        private readonly jwtService: JwtService,
        private readonly configService: CoreConfigService<ConfigModel>,
    ) {}

    private async signJwtToken(params: { user: { id: UserId } }) {
        const { user } = params;

        const payload: TokenPayload = { id: user.id };

        const token = await this.jwtService.signAsync(payload, {
            secret: this.configService.env.JWT_SECRET,
        });

        return { token };
    }

    public async signIn(
        { authToken, idToken }: SignInPrivyDto,
        body: SignInDto,
    ): Promise<SignInResponseDto | BaseError<{ message: string }> | UserNotFound | UnauthorizedError> {
        const privyUser = await this.privy.checkTokens(authToken, idToken);

        if (isError(privyUser)) {
            return privyUser;
        }

        const authentication = await this.prisma.privyPayload.findUnique({
            where: {
                address: privyUser.id,
                type: PrivyPayloadType.PRIVY,
            },
            select: {
                user: true,
            },
        });

        let candidate;
        if (authentication) {
            candidate = await this.userService.findById({ id: authentication.user.id });
            if (isError(candidate)) {
                return candidate;
            }
        } else {
            const candidate = await this.prisma.$transaction(
                async (tx) => {
                    return this.register(privyUser, body, tx);
                },
                { isolationLevel: TransactionIsolationLevel.Serializable },
            );
            if (isError(candidate)) {
                return candidate;
            }
        }

        const token = await this.signJwtToken({ user: candidate });

        return { ...candidate, ...token };
    }

    async register(privyUser: PrivyUser, { refCode }: SignInDto, tx?: PrismaTransaction) {
        const prisma = tx || this.prisma;

        const created = await this.userService.create(
            { data: { privyUser, email: privyUser.email?.address ?? null } },
            prisma,
        );

        if (isError(created)) {
            return created;
        }

        await this.referralService.assignReferralToUser({ userId: created.id, refCode }, prisma);

        return this.userService.findById({ id: created.id }, prisma);
    }
}

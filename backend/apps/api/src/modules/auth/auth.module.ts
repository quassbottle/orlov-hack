import { CoreConfigService, PrivyModule, PrivyModuleOptions } from '@app/core';
import { PrismaModule } from '@app/prisma';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModel } from '../../config/config.model';
import { ConfigModule } from '../../config/config.module';
import { ReferralModule } from '../referral/referral.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtUserStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        PrismaModule,
        PrivyModule.forRootAsync({
            inject: [CoreConfigService<ConfigModel>],
            imports: [ConfigModule],
            useFactory: (config: CoreConfigService<ConfigModel>): PrivyModuleOptions => ({
                appId: config.env.PRIVY_APP_ID,
                appSecret: config.env.PRIVY_APP_SECRET,
            }),
        }),
        UserModule,
        ReferralModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [CoreConfigService],
            useFactory: (configService: CoreConfigService<ConfigModel>) => ({
                secret: configService.env.JWT_SECRET,
                signOptions: { expiresIn: configService.env.JWT_EXPIRES_IN },
            }),
        }),
    ],
    providers: [AuthService, JwtUserStrategy],
    controllers: [AuthController],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtUserStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '@app/db';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        PrismaModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.getOrThrow('JWT_EXPIRES_IN'),
                },
            }),
        }),
    ],
    providers: [AuthService, JwtUserStrategy],
    controllers: [AuthController],
})
export class AuthModule {}
